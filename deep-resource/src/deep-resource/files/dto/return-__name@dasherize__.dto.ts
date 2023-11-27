import { OmitType } from '@nestjs/swagger';
import { <%= classify(name) %>Entity } from '../entities/<%= dasherize(name) %>.entity';

export class Return<%= classify(name) %>Dto extends OmitType(<%= classify(name) %>Entity, [] as const) {}
