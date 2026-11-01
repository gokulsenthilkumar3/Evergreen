import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  Matches,
} from 'class-validator';
export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING',
  'ON_HOLD',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
] as const;
export class CreateTicketDto {
  @IsUUID() requestKey!: string;
  @IsString() @Length(3, 160) subject!: string;
  @IsString() @Length(10, 4000) description!: string;
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{0,59}$/)
  category!: string;
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority!: string;
}
export class TicketVersionDto {
  @IsInt() @Min(1) version!: number;
}
export class UpdateTicketDto extends TicketVersionDto {
  @IsIn(TICKET_STATUSES) status!: string;
  @IsOptional() @IsString() @Length(0, 2000) resolution?: string;
}
export class TicketMessageDto extends TicketVersionDto {
  @IsUUID() requestKey!: string;
  @IsString() @Length(1, 4000) text!: string;
  @IsIn(['PUBLIC', 'INTERNAL']) visibility!: string;
  @IsOptional() @IsString() @Length(1,80) aiDraftId?:string;
}
export class AssignTicketDto extends TicketVersionDto {
  @IsOptional() @IsInt() @Min(1) assigneeId?: number | null;
  @IsString() @Matches(/^[A-Z][A-Z0-9_]{0,59}$/) queue!: string;
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority!: string;
  @IsString() @Length(5, 500) reason!: string;
}
export class TicketFeedbackDto extends TicketVersionDto {
  @IsIn(['FIXED', 'BROKEN']) outcome!: string;
  @IsString() @Length(5, 1000) reason!: string;
}
export type HelpdeskActor = { userId: number; username: string; role: string };
