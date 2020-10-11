import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/events/entities/event.entity';
// import { ConfigModule } from '@nestjs/config';
// import { COFFEE_BRANDS } from './coffees.constants';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee, CoffeeSchema } from './entities/coffee.entity';
// import { Coffee } from './entities/coffee.entity';
// import { Flavor } from './entities/flavors.entity';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coffee.name, schema: CoffeeSchema },
      {
        name: Event.name,
        schema: EventSchema,
      },
    ]),
  ],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    // { provide: COFFEE_BRANDS, useValue: ['buddy brew', 'nescafe'] },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
