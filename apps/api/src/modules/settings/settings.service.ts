import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        const settings = await this.prisma.systemSettings.findFirst();
        if (!settings) {
            console.log('⚙️ Initializing default system settings...');
            return this.prisma.systemSettings.create({
                data: {} // Uses defaults defined in schema
            });
        }
        return settings;
    }

    async updateSettings(data: any) {
        const settings = await this.getSettings();

        // Remove id and updatedAt if present in data
        const { id, updatedAt, ...updateData } = data;

        return this.prisma.systemSettings.update({
            where: { id: settings.id },
            data: updateData
        });
    }
}
