import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TicketVersionDto } from './helpdesk.dto';
export const RESOURCE_KINDS = [
  'QUEUE',
  'SLA',
  'CALENDAR',
  'CATEGORY',
  'MACRO',
  'KB',
  'VIEW',
  'PREFERENCE',
  'RULE',
  'TEMPLATE',
  'RETENTION',
] as const;
export class TicketPageDto {
  @IsOptional() @IsString() @Length(0, 160) q?: string;
  @IsOptional() @IsString() @Length(1, 80) cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25;
  @IsOptional()
  @IsIn([
    'OPEN',
    'IN_PROGRESS',
    'PENDING',
    'ON_HOLD',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
    'ALL',
  ])
  status?: string;
  @IsOptional() @IsString() @Length(1, 60) queue?: string;
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'ALL'])
  priority?: string;
  @IsOptional() @IsIn(['ALL', 'MINE', 'UNASSIGNED']) assignment?: string;
}
export class SaveSupportResourceDto {
  @IsIn(RESOURCE_KINDS) kind!: string;
  @IsString() @Matches(/^[a-zA-Z0-9_-]{1,60}$/) key!: string;
  @IsString() @Length(3, 160) title!: string;
  @IsIn(['PRIVATE', 'TEAM', 'PUBLIC']) visibility!: string;
  @IsIn(['ACTIVE', 'DRAFT', 'PUBLISHED', 'ARCHIVED']) status!: string;
  @IsObject() data!: Record<string, unknown>;
  @IsInt() @Min(0) version!: number;
  @IsString() @Length(5, 500) reason!: string;
}
export class TicketMetadataDto extends TicketVersionDto {
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(1, 40, { each: true })
  tags!: string[];
  @IsObject() customFields!: Record<string, unknown>;
  @IsArray()
  @ArrayMaxSize(30)
  @IsInt({ each: true })
  @Min(1, { each: true })
  watchers!: number[];
  @IsOptional() @IsString() @Length(0, 40) dueAt?: string | null;
  @IsString() @Length(5, 500) reason!: string;
}
export class BulkTicketItem extends TicketVersionDto {
  @IsString() @Length(1, 80) id!: string;
}
export class BulkTicketDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => BulkTicketItem)
  tickets!: BulkTicketItem[];
  @IsIn(['ASSIGN', 'STATUS', 'TAG','MERGE','SPLIT']) operation!: string;
  @IsOptional() @IsUUID() requestKey?:string;
  @IsOptional() @IsString() @Length(10,4000) details?:string;
  @IsString() @Length(1, 80) value!: string;
  @IsString() @Length(5, 500) reason!: string;
}
export class MergeTicketDto extends TicketVersionDto {
  @IsString() @Length(1, 80) targetId!: string;
  @IsInt() @Min(1) targetVersion!: number;
  @IsString() @Length(5, 500) reason!: string;
}
export class SplitTicketDto extends TicketVersionDto {
  @IsUUID() requestKey!: string;
  @IsString() @Length(3, 160) subject!: string;
  @IsString() @Length(10, 4000) description!: string;
  @IsString() @Length(5, 500) reason!: string;
}
export class ArticleFeedbackDto {
  @IsBoolean() helpful!: boolean;
}
export class TicketAttachmentDto extends TicketVersionDto {
  @IsString() @Length(1, 120) filename!: string;
  @IsString() @Length(1, 80) mime!: string;
  @IsString() @Length(4, 700000) base64!: string;
  @IsIn(['PUBLIC', 'INTERNAL']) visibility!: string;
}
export class TicketAcknowledgementDto extends TicketVersionDto {
  @IsString() @Length(1, 80) eventId!: string;
}
export class TicketReplyRevisionDto extends TicketVersionDto {
  @IsString() @Length(1, 4000) text!: string;
  @IsString() @Length(5, 500) reason!: string;
}
export class TicketWorkDto extends TicketVersionDto {
  @IsIn(['TIME', 'LINK', 'OWNER_ATTENTION']) operation!: string;
  @IsString() @Length(5, 500) reason!: string;
  @IsOptional() @IsInt() @Min(1) @Max(1440) minutes?: number;
  @IsOptional()
  @IsIn(['TICKET', 'KB', 'INVOICE', 'WORKFLOW'])
  recordType?: string;
  @IsOptional() @IsString() @Length(1, 80) recordId?: string;
}
export class TicketAiDto extends TicketVersionDto {
 @IsIn(['DRAFT','SUMMARY','CLASSIFY','SUGGEST']) operation!:string;
 @IsString() @Length(1,6000) context!:string;
 @IsBoolean() consent!:boolean;
 @IsIn(['en','ta']) language!:string;
}
export class DispatchTicketEmailDto extends TicketVersionDto {
  @IsString() @Length(1, 80) eventId!: string;
  @IsIn(['primary', 'secondary']) sender!: 'primary' | 'secondary';
  @IsEmail() confirmRecipient!: string;
  @IsString() @Matches(/^[a-f0-9]{64}$/) previewHash!:string;
}
export class TicketCsatDto extends TicketVersionDto {
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsString() @Length(0, 1000) comment!: string;
}
export class ImportTicketRow {
  @IsUUID() requestKey!: string;
  @IsString() @Length(3, 160) subject!: string;
  @IsString() @Length(10, 4000) description!: string;
  @IsIn(['BUG', 'QUESTION', 'ACCESS', 'INTEGRATION', 'BILLING', 'DATA'])
  category!: string;
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority!: string;
}
export class ImportTicketsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ImportTicketRow)
  rows!: ImportTicketRow[];
  @IsBoolean() dryRun!: boolean;
  @IsOptional() @IsString() @Length(64, 64) previewHash?: string;
}
