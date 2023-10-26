import { Module } from '@nestjs/common';
import { {{ pascalCase name }}Controller } from './{{ kebabCase name }}.controller';
import { {{ pascalCase name }}Service } from './{{ kebabCase name }}.service';

{{#if file}}
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
{{/if}}

@Module({
  controllers: [{{ pascalCase name }}Controller],
  exports: [{{ pascalCase name }}Service],
  providers: [{{ pascalCase name }}Service],
  {{#if file}}
  imports: [
    MulterModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          dest: configService.get<string>('FILE_DEST'),
        }),
        inject: [ConfigService],
    }),
  ],
  {{/if}}
})
export class {{ pascalCase name }}Module {}