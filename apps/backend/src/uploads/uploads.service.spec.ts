import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('stores runtime admin uploads in persistent Supabase storage', async () => {
    const upload = jest.fn().mockResolvedValue({ data: {}, error: null });
    const getPublicUrl = jest.fn().mockImplementation((objectPath: string) => ({
      data: {
        publicUrl: `https://example.supabase.co/storage/v1/object/public/figure-lab-media/${objectPath}`,
      },
    }));

    const serviceInternals = service as unknown as {
      storageProvider: () => 'filesystem' | 'supabase';
      supabaseBucket: () => {
        upload: typeof upload;
        getPublicUrl: typeof getPublicUrl;
      };
    };
    jest.spyOn(serviceInternals, 'storageProvider').mockReturnValue('supabase');
    jest.spyOn(serviceInternals, 'supabaseBucket').mockReturnValue({
      upload,
      getPublicUrl,
    });

    const result = await service.saveImage(
      {
        mimetype: 'image/png',
        originalname: 'feedback.png',
        buffer: Buffer.from('feedback-image'),
        size: 14,
      },
      'https://api.example.com',
      'admin',
    );

    const objectPath = `uploads/admin/${result.fileName}`;
    expect(upload).toHaveBeenCalledWith(
      objectPath,
      Buffer.from('feedback-image'),
      {
        cacheControl: '31536000',
        contentType: 'image/png',
        upsert: false,
      },
    );
    expect(getPublicUrl).toHaveBeenCalledWith(objectPath);
    expect(result).toEqual({
      url: `https://example.supabase.co/storage/v1/object/public/figure-lab-media/${objectPath}`,
      fileName: result.fileName,
      originalName: 'feedback.png',
    });
  });
});
