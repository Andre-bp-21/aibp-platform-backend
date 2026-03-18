import { Request, Response } from 'express';

export class AnalysisService {
  static calculateBusinessScore(data: any): { score: number; grade: string; details: any } {
    const revenue = parseFloat(data.revenue) || 0;
    const costs = parseFloat(data.costs) || 0;
    const teamSize = parseInt(data.team_size) || 1;

    const margin = revenue > 0 ? (revenue - costs) / revenue : 0;
    const revenuePerPerson = revenue / Math.max(teamSize, 1);

    let score = 0;

    if (margin > 0.5) score += 25;
    else if (margin > 0.35) score += 20;
    else if (margin > 0.2) score += 15;
    else if (margin > 0.1) score += 10;
    else if (margin > 0) score += 5;

    if (revenuePerPerson > 100000) score += 25;
    else if (revenuePerPerson > 75000) score += 20;
    else if (revenuePerPerson > 50000) score += 15;
    else if (revenuePerPerson > 25000) score += 10;
    else if (revenuePerPerson > 0) score += 5;

    if (margin > 0 && teamSize <= 20) score += 25;
    else if (margin > 0 && teamSize <= 50) score += 20;
    else if (margin > 0) score += 15;

    score += 25;
    score = Math.min(100, Math.max(0, score));

    const grade = score >= 85 ? 'S' : score >= 70 ? 'A' : score >= 55 ? 'B' : score >= 40 ? 'C' : 'D';

    return {
      score,
      grade,
      details: {
        margin: Math.round(margin * 100),
        revenuePerPerson: Math.round(revenuePerPerson),
      },
    };
  }

  static generateInsights(data: any): string[] {
    const insights: string[] = [];
    const revenue = parseFloat(data.revenue) || 0;
    const costs = parseFloat(data.costs) || 0;
    const margin = revenue > 0 ? (revenue - costs) / revenue : 0;

    if (margin > 0.4) {
      insights.push('✅ Margen muy saludable - considera expansión');
    } else if (margin > 0.25) {
      insights.push('✅ Margen en rango normal - buen desempeño');
    } else if (margin > 0.1) {
      insights.push('⚠️ Margen ajustado - revisar costos operacionales');
    } else if (margin < 0) {
      insights.push('❌ Margen negativo - operación no rentable');
    }

    const revenueGrowthPotential = revenue * 0.2;
    insights.push(`💡 Potencial de crecimiento: +$${Math.round(revenueGrowthPotential).toLocaleString()}`);

    if (costs > revenue * 0.7) {
      insights.push('🔍 Considera optimizar estructura de costos');
    }

    return insights;
  }
}

export class AnalysisController {
  static async analyzeBusiness(req: Request, res: Response): Promise<void> {
    try {
      const { businessData, modules } = req.body;

      if (!businessData) {
        res.status(400).json({ success: false, error: 'Datos de negocio requeridos' });
        return;
      }

      const results: any = {};

      const scoreAnalysis = AnalysisService.calculateBusinessScore(businessData);
      results.score = scoreAnalysis;

      if (modules?.includes('insights')) {
        results.insights = AnalysisService.generateInsights(businessData);
      }

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error en análisis',
      });
    }
  }

  static async simulateScenario(req: Request, res: Response): Promise<void> {
    try {
      const { businessData, scenario } = req.body;

      if (!businessData || !scenario) {
        res.status(400).json({ success: false, error: 'Datos faltantes' });
        return;
      }

      const simulated = { ...businessData };
      if (scenario.priceIncrease) {
        simulated.revenue = simulated.revenue * (1 + scenario.priceIncrease / 100);
      }
      if (scenario.costReduction) {
        simulated.costs = simulated.costs * (1 - scenario.costReduction / 100);
      }

      const beforeScore = AnalysisService.calculateBusinessScore(businessData);
      const afterScore = AnalysisService.calculateBusinessScore(simulated);

      res.status(200).json({
        success: true,
        data: {
          before: beforeScore,
          after: afterScore,
          improvement: afterScore.score - beforeScore.score,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error en simulación',
      });
    }
  }
}
