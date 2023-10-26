import { Module } from '@nestjs/common';
import { <%= classify(name) %>Controller } from './<%= dasherize(name) %>.controller';
import { <%= classify(name) %>Service } from './<%= dasherize(name) %>.service';
import { <%= classify(name) %>Entity } from './entities/<%= dasherize(name) %>.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
<% if (file) { %>
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
<% } %>

@Module({
  controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service],
  exports: [<%= classify(name) %>Service],
  
  imports: [
	TypeOrmModule.forFeature([<%= classify(name) %>Entity]),
<% if (file) { %>
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('FILE_DEST'),
      }),
      inject: [ConfigService],
    }),
 <% } %>
  ],
 
})
export class <%= classify(name) %>Module {}
