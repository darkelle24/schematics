import { OMITTED_FIELDS } from '@Helper/omitted-field.helper'; // Assurez-vous que le chemin est correct
import { OmitType } from '@nestjs/swagger';
import { <%= classify(name) %>Entity } from '../entities/<%= dasherize(name) %>.entity';

export class Create<%= classify(name) %>Dto extends OmitType(<%= classify(name) %>Entity, [...OMITTED_FIELDS] as const)
{}
