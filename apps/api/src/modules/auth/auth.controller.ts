import { Controller, Post, Body, Get, Put, Delete, Param, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: any) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
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
