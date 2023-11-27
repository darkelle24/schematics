import { OMITTED_FIELDS } from '@Helper/omitted-field.helper'; // Assurez-vous que le chemin est correct
import { OmitType, PartialType } from '@nestjs/swagger';
import { Create<%= classify(name) %>Dto } from './create-<%= dasherize(name) %>.dto';

export class Update<%= classify(name) %>Dto extends PartialType(
  Create<%= classify(name) %>Dto,
) {}
