import {HttpStatus, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {CreateProductDto} from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import {PrismaClient} from "@prisma/client";
import {PaginationDto} from "../common";
import {RpcException} from "@nestjs/microservices";

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Products service');

  onModuleInit(): any {
    this.$connect();
    this.logger.log("database connected");
  }

  create(createProductDto: CreateProductDto) {

    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;
    const totalPages = await this.product.count({where: {available: true}});
    const lastPage = Math.ceil(totalPages / limit);
    return {
      data: await this.product.findMany({
        where: {available: true},
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page,
        lastPage,
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {id, available: true}
    });

    if (!product) {
      throw new RpcException({message: 'Product not found', status: HttpStatus.BAD_REQUEST});
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id: __, ...data} = updateProductDto;

    await this.findOne(id);
    return this.product.update({
      where: {id},
      data
    })
  }

  async remove(id: number) {
    let product = await this.findOne(id);

    if (!product) {
      throw new RpcException({message: 'Product not found'});
    }

    // no hard delete
    /*return this.product.delete({
      where: {id}
    });*/
    product = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    });

    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products are missing',
        status: HttpStatus.BAD_REQUEST,
      })
    }

    return products;
  }
}
