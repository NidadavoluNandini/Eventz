import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contact')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // PUBLIC: Contact Us form
  @Post()
  create(@Body() dto: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    return this.contactsService.create(dto);
  }

  // ADMIN / ORGANIZER (later protect with guard)
  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

 
}
