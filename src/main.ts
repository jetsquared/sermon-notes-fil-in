import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import { AppModule } from './app.module';
import { QuestionsService } from './questions/questions.service';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Add JSON helper for handlebars
  hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });
  
  const questionsService = app.get(QuestionsService);
  await questionsService.loadQuestions();
  
  // Redirect root to questions
  app.getHttpAdapter().get('/', (_: Request, res: Response) => { res.redirect('/questions'); });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
