import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ===============================
  // ORGANIZER DASHBOARD ANALYTICS
  // ===============================
  async getOrganizerAnalytics(organizerId: string) {
    const orgId = new Types.ObjectId(organizerId);

    const events = await this.eventModel.find({ organizerId: orgId });
    const eventIds = events.map((e) => e._id);

    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length;
    const draftEvents = events.filter(e => e.status === 'DRAFT').length;
    const completedEvents = events.filter(e => e.status === 'COMPLETED').length;

    const totalRegistrations = await this.registrationModel.countDocuments({
      eventId: { $in: eventIds },
      status: RegistrationStatus.COMPLETED,
    });

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

    const totalRevenue = revenueResult[0]?.total || 0;

    // Ticket name based stats (FREE, VIP, STUDENT PASS, etc.)
    const ticketStats = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: RegistrationStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$ticketName',
          count: { $sum: 1 },
          revenue: { $sum: '$ticketPrice' },
        },
      },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRegistrations = await this.registrationModel.countDocuments({
      eventId: { $in: eventIds },
      status: RegistrationStatus.COMPLETED,
      createdAt: { $gte: sevenDaysAgo },
    });

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
      { $sort: { registrations: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $project: {
          eventId: '$_id',
          eventTitle: '$event.title',
          registrations: 1,
          revenue: 1,
        },
      },
    ]);

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
      { $sort: { _id: 1 } },
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
      ticketStats,
      topEvents,
      registrationsTrend,
    };
  }

  // ===============================
  // SINGLE EVENT ANALYTICS
  // ===============================
  async getEventAnalytics(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    const totalRegistrations = await this.registrationModel.countDocuments({
      eventId: new Types.ObjectId(eventId),
      status: RegistrationStatus.COMPLETED,
    });

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

    const totalRevenue = revenueResult[0]?.total || 0;

    const ticketBreakdown = await this.registrationModel.aggregate([
      {
        $match: {
          eventId: new Types.ObjectId(eventId),
          status: RegistrationStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$ticketName',
          count: { $sum: 1 },
          revenue: { $sum: '$ticketPrice' },
        },
      },
    ]);

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
        status: event.status,
        registrationOpen: event.registrationOpen,
      },
      analytics: {
        totalRegistrations,
        totalRevenue,
        registrationStatus: event.registrationOpen ? 'OPEN' : 'CLOSED',
      },
      ticketBreakdown,
      paymentStatusBreakdown,
    };
  }

  // ===============================
  // EVENT USERS LIST
  // ===============================
  async getEventUsers(
    eventId: string,
    filters?: {
      ticketName?: string;
      paymentStatus?: string;
    },
  ) {
    const query: any = {
      eventId: new Types.ObjectId(eventId),
      status: RegistrationStatus.COMPLETED,
    };

    if (filters?.ticketName) {
      query.ticketName = filters.ticketName;
    }

    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    return this.registrationModel
      .find(query)
      .select(
        'userName userEmail userPhone ticketName ticketPrice paymentStatus registrationNumber createdAt',
      )
      .sort({ createdAt: -1 });
  }
}
