import { Test, TestingModule } from '@nestjs/testing';
import { DirectoresObraService } from './directores-obra.service';

describe('DirectoresObraService', () => {
  let service: DirectoresObraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectoresObraService],
    }).compile();

    service = module.get<DirectoresObraService>(DirectoresObraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
