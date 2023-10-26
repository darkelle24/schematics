// Les imports nécessaires doivent être présents, assurez-vous que les chemins sont corrects
import { OmitType } from '@nestjs/swagger';
import { } from {};
{ pascalCase name }}Entity } from '../entities/{{ kebabCase name }}.entity';

export class Return{{ pascalCase name }}Dto extends OmitType({{ pascalCase name }}Entity, [] as const) {}
