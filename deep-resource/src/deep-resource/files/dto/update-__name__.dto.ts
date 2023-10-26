import { OMITTED_FIELDS } from '@Helper/omitted-field.helper'; // Assurez-vous que le chemin est correct
import { OmitType, PartialType } from '@nestjs/swagger';
import { <%= classify(name) %>Entity } from '../entities/<%= dasherize(name) %>.entity';

export class Update<%= classify(name) %>AdminDto extends PartialType(
  OmitType(<%= classify(name) %>Entity, [...OMITTED_FIELDS] as const),
) {}
