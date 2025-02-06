import { Controller, Get, Param, Render, NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './question.entity';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get(':id')
  @Render('question')
  async getQuestion(@Param('id') id: string): Promise<{ question: Question }> {
    const question = this.questionsService.getQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return { question };
  }

  @Get()
  @Render('questions-list')
  async getAllQuestions(): Promise<{ questions: Question[] }> {
    return { questions: this.questionsService.getAllQuestions() };
  }
} 