import { CRUDService } from '@Helper/crud.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= classify(name) %>Entity } from './entities/<%= name.toLowerCase() %>.entity';

@Injectable()
export class <%= classify(name) %>Service extends CRUDService<<%= classify(name) %>Entity> {
  constructor(
    @InjectRepository(<%= classify(name) %>Entity)
    protected readonly <%= camelize(name) %>Repository: Repository<<%= classify(name) %>Entity>,
  ) {
    super(<%= camelize(name) %>Repository, '<%= classify(name) %>');
  }
}
