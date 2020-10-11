import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
// import { Flavor } from './entities/flavors.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name)
    private readonly coffeeModel: Model<Coffee>,

    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>, // @InjectRepository(Flavor) // private readonly flavorRepository: Repository<Flavor>, // private readonly connection: Connection, // @Inject(COFFEE_BRANDS) coffeesBrands: string[], // private readonly configService: ConfigService,
  ) {
    // const databaseHost = this.configService.get('database.host', 'localhost');
    // console.log(databaseHost);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<Coffee[]> {
    const { limit, offset } = paginationQuery;
    return this.coffeeModel
      .find()
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Coffee> {
    const coffee = await this.coffeeModel
      .findOne({
        _id: id,
      })
      .exec();

    if (!coffee) {
      throw new HttpException(`Coffee #${id} not found`, HttpStatus.NOT_FOUND);
    }

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    // const flavors = await Promise.all(
    //   createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
    // );

    const coffee = new this.coffeeModel(createCoffeeDto);

    return coffee.save();
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    // const flavors =
    //   updateCoffeeDto.flavors &&
    //   (await Promise.all(
    //     updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
    //   ));

    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
      .exec();

    if (!existingCoffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return existingCoffee;
  }

  async remove(id: string): Promise<Coffee> {
    const coffee = await this.findOne(id);
    return coffee.remove();
  }

  // private async preloadFlavorByName(name: string): Promise<Flavor> {
  //   const existingFlavor = await this.flavorRepository.findOne({ name });

  //   if (existingFlavor) {
  //     return existingFlavor;
  //   }

  //   return this.flavorRepository.create({ name });
  // }

  async recommendCoffee(coffee: Coffee): Promise<void> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id },
      });

      await recommendEvent.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}
