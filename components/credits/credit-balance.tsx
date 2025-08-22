"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Coins, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditSummary, CREDIT_THRESHOLDS } from "@/lib/types/credits"
import { CreditPurchaseModal } from "./credit-purchase-modal"

interface CreditBalanceProps {
  showDetails?: boolean
  showPurchaseButton?: boolean
  onBalanceUpdate?: (balance: number) => void
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function CreditBalance({ 
  showDetails = true, 
  showPurchaseButton = true,
  onBalanceUpdate,
  className = "",
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds default
}: CreditBalanceProps) {
  const { data: session } = useSession()
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCreditBalance = async () => {
    if (!session?.user?.id) return

    try {
      setError(null)
      const response = await fetch('/api/credits/balance')
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit balance')
      }

      const result = await response.json()
      setCreditSummary(result.data)
      onBalanceUpdate?.(result.data.currentBalance)
    } catch (error) {
      console.error('Error fetching credit balance:', error)
      setError('Failed to load credit balance')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCreditBalance()
  }

  useEffect(() => {
    fetchCreditBalance()
  }, [session?.user?.id])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !session?.user?.id) return

    const interval = setInterval(() => {
      fetchCreditBalance()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, session?.user?.id])

  // Listen for credit usage events
  useEffect(() => {
    const handleCreditUpdate = () => {
      fetchCreditBalance()
    }

    // Listen for custom credit update events
    window.addEventListener('credit-updated', handleCreditUpdate)
    
    return () => {
      window.removeEventListener('credit-updated', handleCreditUpdate)
    }
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          {showDetails && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (error || !creditSummary) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {error || 'Unable to load credit balance'}
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getBalanceColor = () => {
    if (creditSummary.currentBalance <= CREDIT_THRESHOLDS.CRITICAL_BALANCE) {
      return "text-red-600 dark:text-red-400"
    }
    if (creditSummary.currentBalance <= CREDIT_THRESHOLDS.LOW_BALANCE) {
      return "text-yellow-600 dark:text-yellow-400"
    }
    return "text-green-600 dark:text-green-400"
  }

  const getBalanceBadgeVariant = () => {
    if (creditSummary.currentBalance <= CREDIT_THRESHOLDS.CRITICAL_BALANCE) {
      return "destructive"
    }
    if (creditSummary.currentBalance <= CREDIT_THRESHOLDS.LOW_BALANCE) {
      return "secondary"
    }
    return "default"
  }

  return (
    <>
      <Card className={className}>
        {showDetails && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                Credits
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {creditSummary.lowBalanceWarning && (
              <CardDescription className="text-yellow-600 dark:text-yellow-400 text-xs">
                Low credit balance - consider purchasing more credits
              </CardDescription>
            )}
          </CardHeader>
        )}
        
        {!showDetails && creditSummary.lowBalanceWarning && (
          <CardHeader className="pb-1">
            <CardDescription className="text-yellow-600 dark:text-yellow-400 text-xs">
              Low credit balance
            </CardDescription>
          </CardHeader>
        )}

        <CardContent className={showDetails ? "space-y-4" : "space-y-2 pt-2 pb-2"}>
          {/* Current Balance */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!showDetails && (
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">
                    {creditSummary.currentBalance}
                  </span>
                </div>
              )}
              {showDetails && (
                <span className="text-2xl font-bold text-yellow-600">
                  {creditSummary.currentBalance}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Badge variant={getBalanceBadgeVariant()} className="text-xs">
                  {creditSummary.currentBalance <= CREDIT_THRESHOLDS.CRITICAL_BALANCE
                    ? 'Critical'
                    : creditSummary.currentBalance <= CREDIT_THRESHOLDS.LOW_BALANCE
                    ? 'Low'
                    : 'Good'}
                </Badge>
                {!showDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="h-6 w-6 p-0 ml-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${(creditSummary.currentBalance * 0.1).toFixed(2)} value
            </p>
          </div>

          {showDetails && (
            <>
              {/* Lifetime Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-medium">Earned</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {creditSummary.totalEarned}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs font-medium">Spent</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {creditSummary.totalSpent}
                  </p>
                </div>
              </div>

              {/* Recent Transactions Preview */}
              {creditSummary.recentTransactions.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recent Activity
                  </p>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {creditSummary.recentTransactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <span className="truncate text-muted-foreground">
                          {tx.description}
                        </span>
                        <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Purchase Button */}
          {showPurchaseButton && (
            <Button 
              onClick={() => setShowPurchaseModal(true)}
              className="w-full"
              variant={creditSummary.lowBalanceWarning ? "default" : "outline"}
              size={showDetails ? "default" : "sm"}
            >
              <Coins className={`${showDetails ? 'h-4 w-4' : 'h-3 w-3'} mr-2`} />
              {showDetails ? "Buy Credits" : "Buy"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <CreditPurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={fetchCreditBalance}
        currentBalance={creditSummary.currentBalance}
      />
    </>
  )
}
