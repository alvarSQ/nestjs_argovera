import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
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
import * as json2csv from 'json2csv';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async importCategoriesFromCSV(@UploadedFile() file: Express.Multer.File) {
    return this.categoryService.importCategoriesFromCSV(file);
  }

  @Get('export')
  async exportCategoriesToCSV(@Res() res: Response) {
    const categories = await this.categoryService.exportCategories();

    // Преобразование массива объектов в CSV строку
    const csv = json2csv.parse(categories);

    res.set('Content-Type', 'text/csv');
    res.set(
      'Content-Disposition',
      `attachment; filename="categories_${Date.now()}.csv"`,
    );
    res.send(csv);
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
  async create(
    @Body('category') createCategoryDto: CreateCategoryDto,
  ): Promise<ICategoryResponse> {
    const category =
      await this.categoryService.createCategory(createCategoryDto);
    return this.categoryService.buildCategoryResponse(category);
  }

  @Get(':slug')
  async getSingleArticle(
    @Param('slug') slug: string,
  ): Promise<ICategoryResponse> {
    const category = await this.categoryService.findBySlug(slug);
    return this.categoryService.buildCategoryResponse(category);
  }

  // @Delete(':slug')
  // async deleteCategory(@Param('slug') slug: string) {
  //   return await this.categoryService.deleteCategory(slug);
  // }
}
