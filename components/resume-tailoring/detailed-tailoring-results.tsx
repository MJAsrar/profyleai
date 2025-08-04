"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  AlertCircle, 
  Target, 
  TrendingUp, 
  FileText, 
  Settings, 
  Code,
  Zap,
  BarChart3,
  Hash,
  Eye,
  Lightbulb
} from "lucide-react"

interface ATSBreakdown {
  keywordMatch: number
  formatScore: number
  relevanceScore: number
  overallScore: number
}

interface DetailedChange {
  changed: boolean
  changeType: string
  keywordsAdded: string[]
  improvementReason: string
}

interface DetailedChanges {
  summary: DetailedChange
  experience: Array<DetailedChange & { id: string }>
  skills: DetailedChange & { 
    skillsReordered: string[]
    skillsAdded: string[]
  }
  projects?: Array<DetailedChange & { id: string }>
}

interface KeywordAnalysis {
  jobKeywords: string[]
  matchedKeywords: string[]
  missedKeywords: string[]
  addedKeywords: string[]
}

interface DetailedTailoringResultsProps {
  matchScore: number
  atsBreakdown: ATSBreakdown
  detailedChanges: DetailedChanges
  keywordAnalysis: KeywordAnalysis
  tailoringNotes: string
  jobTitle: string
  companyName: string
}

export function DetailedTailoringResults({
  matchScore,
  atsBreakdown,
  detailedChanges,
  keywordAnalysis,
  tailoringNotes,
  jobTitle,
  companyName
}: DetailedTailoringResultsProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 75) return "secondary"
    return "destructive"
  }

  const changedSectionsCount = [
    detailedChanges.summary.changed,
    detailedChanges.skills.changed,
    detailedChanges.experience.some(exp => exp.changed),
    detailedChanges.projects?.some(proj => proj.changed)
  ].filter(Boolean).length

  const totalKeywordsAdded = [
    ...detailedChanges.summary.keywordsAdded,
    ...detailedChanges.experience.flatMap(exp => exp.keywordsAdded),
    ...detailedChanges.skills.keywordsAdded || [],
    ...(detailedChanges.projects?.flatMap(proj => proj.keywordsAdded) || [])
  ]

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Tailoring Complete - Detailed Results
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your resume has been optimized for <strong>{jobTitle}</strong> at <strong>{companyName}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className={`text-3xl font-bold ${getScoreColor(matchScore)}`}>
                {matchScore}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Match</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-blue-600">{changedSectionsCount}</div>
              <div className="text-xs text-muted-foreground">Sections Updated</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-600">{totalKeywordsAdded.length}</div>
              <div className="text-xs text-muted-foreground">Keywords Added</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round((keywordAnalysis.matchedKeywords.length / keywordAnalysis.jobKeywords.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Keyword Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="ats-breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ats-breakdown" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ATS Score
          </TabsTrigger>
          <TabsTrigger value="changes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* ATS Breakdown Tab */}
        <TabsContent value="ats-breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ATS Optimization Score
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                How well your resume will perform in Applicant Tracking Systems
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Keyword Match", score: atsBreakdown.keywordMatch, icon: Target, description: "Relevance to job requirements" },
                { label: "Format Score", score: atsBreakdown.formatScore, icon: Settings, description: "ATS-friendly formatting" },
                { label: "Relevance Score", score: atsBreakdown.relevanceScore, icon: TrendingUp, description: "Content alignment with role" },
                { label: "Overall Score", score: atsBreakdown.overallScore, icon: Zap, description: "Combined ATS performance" }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Badge variant={getScoreVariant(item.score)}>
                      {item.score}%
                    </Badge>
                  </div>
                  <Progress value={item.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Changes Tab */}
        <TabsContent value="changes" className="space-y-4">
          <div className="grid gap-4">
            {/* Summary Changes */}
            {detailedChanges.summary.changed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Professional Summary
                    <Badge variant="outline">{detailedChanges.summary.changeType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{detailedChanges.summary.improvementReason}</p>
                  {detailedChanges.summary.keywordsAdded.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Keywords Added:</p>
                      <div className="flex flex-wrap gap-1">
                        {detailedChanges.summary.keywordsAdded.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skills Changes */}
            {detailedChanges.skills.changed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4" />
                    Technical Skills
                    <Badge variant="outline">{detailedChanges.skills.changeType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{detailedChanges.skills.improvementReason}</p>
                  {detailedChanges.skills.skillsReordered.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Skills Prioritized:</p>
                      <div className="flex flex-wrap gap-1">
                        {detailedChanges.skills.skillsReordered.slice(0, 8).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Experience Changes */}
            {detailedChanges.experience.filter(exp => exp.changed).map((exp, index) => (
              <Card key={exp.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Experience Entry {index + 1}
                    <Badge variant="outline">{exp.changeType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{exp.improvementReason}</p>
                  {exp.keywordsAdded.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Keywords Added:</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.keywordsAdded.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Projects Changes */}
            {detailedChanges.projects?.filter(proj => proj.changed).map((proj, index) => (
              <Card key={proj.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4" />
                    Project {index + 1}
                    <Badge variant="outline">{proj.changeType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{proj.improvementReason}</p>
                  {proj.keywordsAdded.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Keywords Added:</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.keywordsAdded.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Keywords Analysis Tab */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Matched Keywords ({keywordAnalysis.matchedKeywords.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Keywords from the job description that are now in your resume
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordAnalysis.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {keywordAnalysis.missedKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Missed Opportunities ({keywordAnalysis.missedKeywords.length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Important keywords that could still be added to strengthen your resume
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {keywordAnalysis.missedKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Newly Added Keywords ({keywordAnalysis.addedKeywords.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Keywords that were strategically integrated during tailoring
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordAnalysis.addedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Tailoring Strategy Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{tailoringNotes}</p>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Key Improvements Made:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Enhanced professional summary with role-specific keywords</li>
                    <li>• Prioritized relevant technical skills</li>
                    <li>• Quantified achievements with measurable results</li>
                    <li>• Aligned project descriptions with job requirements</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Next Steps:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Review the enhanced resume preview</li>
                    <li>• Consider creating a matching cover letter</li>
                    <li>• Practice highlighting these improvements in interviews</li>
                    <li>• Save this version for similar role applications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}