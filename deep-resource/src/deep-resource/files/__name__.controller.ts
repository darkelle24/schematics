// __name__.controller.ts.template

import {
    Controller,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { <%= classify(name) %>Service } from './<%= name %>.service';

@ApiTags('<%= classify(name) %>')
@Controller('<%= name.toLowerCase() %>')
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= camelize(name) %>Service: <%= classify(name) %>Service) {}
}
