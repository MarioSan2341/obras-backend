import { Test, TestingModule } from '@nestjs/testing';
import { DirectoresObraController } from './directores-obra.controller';

describe('DirectoresObraController', () => {
  let controller: DirectoresObraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectoresObraController],
    }).compile();

    controller = module.get<DirectoresObraController>(DirectoresObraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
