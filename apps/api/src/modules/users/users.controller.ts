import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AUTHOR')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async register(@Body() createUserDto: any) {
        return this.usersService.createUser(createUserDto);
    }

    @Get()
    async getUsers() {
        return this.usersService.findAllUsers();
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateDto: any) {
        return this.usersService.updateUser(id, updateDto);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
