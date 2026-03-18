import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import fs from 'fs';
import { AnalysisService } from './analysisController';

export class UploadController {
  static async handleFileUpload(req: any, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'Archivo no proporcionado' });
        return;
      }

      const filePath = req.file.path;
      const filename = req.file.filename;
      const fileSize = req.file.size;

      let data: any[] = [];

      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = xlsx.utils.sheet_to_json(worksheet);
      } catch (parseError) {
        fs.unlinkSync(filePath);
        res.status(400).json({ success: false, error: 'Error al parsear archivo' });
        return;
      }

      const insights = data.length > 0 ? AnalysisService.generateInsights(data[0]) : [];

      fs.unlinkSync(filePath);

      res.status(200).json({
        success: true,
        data: {
          filename,
          size: fileSize,
          records_count: data.length,
          table: data,
          insights,
        },
      });
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Error procesando archivo',
      });
    }
  }
}
