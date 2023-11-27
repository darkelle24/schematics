import {
    Controller,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { <%= classify(name) %>Service } from './<%= dasherize(name) %>.service';

@ApiTags('<%= classify(name) %>')
@Controller('<%= name.toLowerCase() %>')
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= camelize(name) %>Service: <%= classify(name) %>Service) {}
}
