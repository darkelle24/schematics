import { ensureDatabaseExists } from '@Helper/check-database.helper';
import { UserTestManager } from '@Helper/test-utils/users-test-utils';
import { RolesEnum } from '@Roles/roles';
import { <%= classify(name) %>Service } from '@<%= classify(name) %>/<%= dasherize(name) %>.service';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule, configGlobal } from '../../src/app.module';

// Les tests spécifiques adaptés à <%= classify(name) %>
import { delete_<%= underscore(name) %>_userId_<%= camelize(name) %>Id } from './tests/delete-<%= dasherize(name) %>-userId-<%= camelize(name) %>Id.e2e-sub-spec';
import { get_<%= underscore(name) %>_year_userId } from './tests/get-<%= dasherize(name) %>-year-userId.e2e-sub-spec';
import { post_<%= underscore(name) %>_userId } from './tests/post-<%= dasherize(name) %>-userId.e2e-sub-spec';
import { put_<%= underscore(name) %>_userId_<%= camelize(name) %>Id } from './tests/put-<%= dasherize(name) %>-userId-<%= camelize(name) %>Id.e2e-sub-spec';

export type Tools<%= classify(name) %> = {
  app: INestApplication;
  userManager: UserTestManager;
  service: <%= classify(name) %>Service;
};

export enum DefaultUser<%= classify(name) %> {
  Admin = 'admin',
  Technician = 'technician',
  User = 'user',
  User2 = 'user2',
  UserNoGroup = 'userNoGroup',
  UserNotSameGroup = 'userNotSameGroup',
}

describe('<%= classify(name) %>Controller (e2e)', () => {
  let app: INestApplication;
  let userManager: UserTestManager;
  let service: <%= classify(name) %>Service;

  const tools: Tools<%= classify(name) %> = {
    app: undefined,
    userManager: undefined,
    service: undefined,
  };

  beforeAll(async () => {
    await ensureDatabaseExists();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);
    await configGlobal(app);
    await app.init();

    service = app.get<<%= classify(name) %>Service>(<%= classify(name) %>Service);
    userManager = new UserTestManager(app, configService);

    await userManager.loginMasterAdmin();

    await userManager.registerUser(
      {
        username: 'adminUser',
        password: 'adminPass',
        email: 'adminUser@gmail.com',
        role: RolesEnum.Admin,
        group: 'test',
      },
      false,
      'admin',
    );

    await userManager.registerUser(
      {
        username: 'normalTechnician',
        password: 'normalPass',
        email: 'normalTechnican@gmail.com',
        role: RolesEnum.Technician,
        group: 'test',
      },
      false,
      'technician',
    );

    await userManager.registerUser(
      {
        username: 'normalUser',
        password: 'normalPass',
        email: 'normalUser@gmail.com',
        role: RolesEnum.User,
        group: 'test',
      },
      false,
      'user',
    );

    await userManager.registerUser(
      {
        username: 'normalUser2',
        password: 'normalPass2',
        email: 'normalUser2@gmail.com',
        role: RolesEnum.User,
        group: 'test',
      },
      false,
      'user2',
    );

    await userManager.registerUser(
      {
        username: 'userNotSameGroup',
        password: 'userNotSameGroupPass',
        email: 'userNotSameGroup@gmail.com',
        role: RolesEnum.User,
        group: 'notSameGroup',
      },
      false,
      'userNotSameGroup',
    );

    await userManager.registerUser(
      {
        username: 'userNoGroup',
        password: 'userNoGroupPass',
        email: 'userNoGroup@gmail.com',
        role: RolesEnum.User,
      },
      false,
      'userNoGroup',
    );

    tools.app = app;
    tools.service = service;
    tools.userManager = userManager;
  });

  beforeEach(async () => {
    // Logique avant chaque test, si nécessaire
  });

  afterEach(async () => {
    // Logique après chaque test, si nécessaire
  });

  afterAll(async () => {
    await userManager.markAllUsersForDeletionAndCleanup();
    console.log('Closing App');
    await app.close();
  });

  // Exécution des tests adaptés
  get_<%= underscore(name) %>_year_userId(tools); // GET <%= basePath %><%= underscore(name) %>/:year/:userId
  post_<%= underscore(name) %>_userId(tools); // POST <%= basePath %><%= underscore(name) %>/:userId
  put_<%= underscore(name) %>_userId_<%= camelize(name) %>Id(tools); // PUT <%= basePath %><%= underscore(name) %>/:userId/:<%= camelize(name) %>Id
  delete_<%= underscore(name) %>_userId_<%= camelize(name) %>Id(tools); // DELETE <%= basePath %><%= underscore(name) %>/:userId/:<%= camelize(name) %>Id
});
