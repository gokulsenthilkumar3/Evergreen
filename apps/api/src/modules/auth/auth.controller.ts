import { Controller, Post, Body, Get, Put, Delete, Param, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: any, @Req() req: Request) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        return this.authService.login(user, { ip, userAgent });
    }

    @Post('users')
    async register(@Body() createUserDto: any) {
        return this.authService.createUser(createUserDto);
    }

    @Get('users')
    async getUsers() {
        return this.authService.findAllUsers();
    }

    @Put('users/:id')
    async updateUser(@Param('id') id: string, @Body() updateDto: any) {
        return this.authService.updateUser(id, updateDto);
    }

    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return this.authService.deleteUser(id);
    }
}
