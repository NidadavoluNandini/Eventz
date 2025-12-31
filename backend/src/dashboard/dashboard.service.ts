import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from '../events/schemas/event.schema';
import { Registration, RegistrationStatus } from '../registrations/schemas/registration.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
  ) {}

  // Get organizer dashboard analytics
  async getOrganizerAnalytics(organizerId: string) {
    const orgId = new Types.ObjectId(organizerId);

    // Get all events by organizer
    const events = await this.eventModel.find({ organizerId: orgId });
    const eventIds = events.map((e) => e._id);

    // Total Events
    const totalEvents = events.length;
    const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;
    const draftEvents = events.filter((e) => e.status === 'DRAFT').length;
    const completedEvents = events.filter((e) => e.status === 'COMPLETED').length;

    // Total Registrations
    const totalRegistrations = await this.registrationModel.countDocuments({
      eventId: { $in: eventIds },
      status: RegistrationStatus.COMPLETED,
    });

    // Total Revenue
    const revenueResult = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: RegistrationStatus.COMPLETED,
          paymentStatus: 'PAID',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$ticketPrice' },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Registrations by ticket type
    const ticketTypeStats = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: RegistrationStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$ticketType',
          count: { $sum: 1 },
          revenue: { $sum: '$ticketPrice' },
        },
      },
    ]);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRegistrations = await this.registrationModel.countDocuments({
      eventId: { $in: eventIds },
      status: RegistrationStatus.COMPLETED,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Top performing events
    const topEvents = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: RegistrationStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$eventId',
          registrations: { $sum: 1 },
          revenue: { $sum: '$ticketPrice' },
        },
      },
      {
        $sort: { registrations: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          eventId: '$_id',
          eventTitle: '$event.title',
          registrations: 1,
          revenue: 1,
        },
      },
    ]);

    // Registrations trend (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationsTrend = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: RegistrationStatus.COMPLETED,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$ticketPrice' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return {
      summary: {
        totalEvents,
        publishedEvents,
        draftEvents,
        completedEvents,
        totalRegistrations,
        totalRevenue,
        recentRegistrations,
      },
      ticketTypeStats,
      topEvents,
      registrationsTrend,
    };
  }

  // Get event-specific analytics
  async getEventAnalytics(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Total registrations
    const totalRegistrations = await this.registrationModel.countDocuments({
      eventId: new Types.ObjectId(eventId),
      status: RegistrationStatus.COMPLETED,
    });

    // Revenue
    const revenueResult = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: new Types.ObjectId(eventId),
          status: RegistrationStatus.COMPLETED,
          paymentStatus: 'PAID',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$ticketPrice' },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Registrations by ticket type
    const ticketTypeBreakdown = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: new Types.ObjectId(eventId),
          status: RegistrationStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$ticketType',
          count: { $sum: 1 },
          revenue: { $sum: '$ticketPrice' },
        },
      },
    ]);

    // Payment status breakdown
    const paymentStatusBreakdown = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: new Types.ObjectId(eventId),
          status: RegistrationStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      event: {
        id: event._id,
        title: event.title,
        date: event.startDate,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
      },
      analytics: {
        totalRegistrations,
        totalRevenue,
        availableTickets: event.capacity - totalRegistrations,
        capacityFilled: ((totalRegistrations / event.capacity) * 100).toFixed(2) + '%',
      },
      ticketTypeBreakdown,
      paymentStatusBreakdown,
    };
  }

  // Get registered users for an event
  async getEventUsers(eventId: string, filters?: {
    ticketType?: string;
    paymentStatus?: string;
  }) {
    const query: any = {
      eventId: new Types.ObjectId(eventId),
      status: RegistrationStatus.COMPLETED,
    };

    if (filters?.ticketType) {
      query.ticketType = filters.ticketType;
    }

    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    return this.registrationModel
      .find(query)
      .select('userName userEmail userPhone ticketType ticketPrice paymentStatus registrationNumber createdAt')
      .sort({ createdAt: -1 });
  }
}
