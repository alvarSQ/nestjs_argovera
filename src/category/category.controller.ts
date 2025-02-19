import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ICategoriesResponse } from './types/categoriesResponse.interface';
import { ICategoryResponse } from './types/categoryResponse.interface';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryService } from './category.service';
import { CategoryEntity } from './category.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { IProductInCategoryResponse } from './types/productInCategoryResponse.interface';
import { AdminGuard } from '@/guards/admin.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('import')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async importCategoriesFromCSV(@UploadedFile() file: Express.Multer.File) {
    return this.categoryService.importCategoriesFromCSV(file);
  }

  @Get('export')
  @UseGuards(AdminGuard)
  async exportCategoriesToCSV(@Res() res: Response) {
    return this.categoryService.jsonToCsv(res);
  }

  @Get()
  async findAll(@Query() query: any): Promise<ICategoriesResponse> {
    return await this.categoryService.findAll(query);
  }

  @Get('tree')
  async findTree(): Promise<CategoryEntity[]> {
    return await this.categoryService.findTree();
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(
    @Body('category') createCategoryDto: CreateCategoryDto,
  ): Promise<ICategoryResponse> {
    const category =
      await this.categoryService.createCategory(createCategoryDto);
    return this.categoryService.buildCategoryResponse(category);
  }

  @Get(':slug')
  async getSingleCategory(
    @Param('slug') slug: string,
  ): Promise<IProductInCategoryResponse> {
    return await this.categoryService.findBySlug(slug);
  }

  @Delete(':slug')
  @UseGuards(AdminGuard)
  async deleteCategory(@Param('slug') slug: string) {
    return await this.categoryService.deleteCategory(slug);
  }
}
