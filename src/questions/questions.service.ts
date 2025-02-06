import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Question, QuestionItem } from './question.entity';

@Injectable()
export class QuestionsService {
  private questions: Map<string, Question> = new Map();

  async loadQuestions() {
    const questionsDir = path.join(process.cwd(), 'content/questions');
    const files = await fs.readdir(questionsDir);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(questionsDir, file), 'utf-8');
        const question = this.parseMarkdown(content, file);
        this.questions.set(question.id, question);
      }
    }
  }

  private parseMarkdown(content: string, filename: string): Question {
    const lines = content.split('\n');
    const questions: QuestionItem[] = [];
    let currentContext = '';
    let globalBlankIndex = 0;

    const processedLines = lines.map(line => {
      const trimmedLine = line.trim()
        // Unescape HTML entities first
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      // Handle headers for context
      if (trimmedLine.startsWith('#')) {
        const headerMatch = trimmedLine.match(/^#+/);
        if (headerMatch) {
          const headerLevel = headerMatch[0].length;
          const headerText = trimmedLine.replace(/^#+\s*/, '');
          currentContext = `<h${headerLevel}>${headerText}</h${headerLevel}>`;
        }
        return line; // Return original line for headers
      } else if (trimmedLine.startsWith('**')) {
        currentContext = `<strong>${trimmedLine.replace(/\*\*/g, '')}</strong>`;
        return line; // Return original line for bold text
      } else if (trimmedLine.includes('#blank')) {
        // Count number of #blank occurrences
        const blankCount = (trimmedLine.match(/#blank/g) || []).length;
        
        // Extract all answers
        const answers: string[] = [];
        let answerMatch: RegExpExecArray | null;
        const answerRegex = /%([^%]+)%/g;
        while ((answerMatch = answerRegex.exec(trimmedLine)) !== null) {
          answers.push(answerMatch[1].trim());
        }

        if (blankCount !== answers.length) {
          console.warn(`Warning: Mismatch between blanks (${blankCount}) and answers (${answers.length}) in line: ${trimmedLine}`);
          return line;
        }

        // Create question items for each blank in this line
        answers.forEach((answer, index) => {
          questions.push({
            question: trimmedLine.replace(/%[^%]+%/g, '').trim(),
            answer,
            context: currentContext,
            blankIndex: globalBlankIndex++
          });
        });

        // Return the line with answers removed
        return trimmedLine.replace(/%[^%]+%/g, '');
      }
      
      return line; // Return unchanged line for regular content
    });

    return new Question({
      id: path.basename(filename, '.md'),
      questions,
      content: processedLines.join('\n') // Add full content to Question
    });
  }

  getQuestion(id: string): Question | undefined {
    return this.questions.get(id);
  }

  getAllQuestions(): Question[] {
    return Array.from(this.questions.values());
  }
} 