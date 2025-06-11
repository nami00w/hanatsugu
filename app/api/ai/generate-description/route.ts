import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      brand, 
      color, 
      condition, 
      ownerHistory,
      size,
      wearCount,
      isCleaned,
      features,
      modelName,
      silhouette,
      neckline
    } = body

    // 1秒の遅延をシミュレート（API呼び出しの雰囲気を出すため）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // オーナー履歴に基づく説明文の調整
    const ownerHistoryMap: Record<string, string> = {
      'first': 'ファーストオーナーとして大切に保管してきました。',
      'second': 'セカンドオーナーですが、前オーナー様も丁寧に扱われていました。',
      'third_plus': '複数のオーナー様を経ていますが、状態は良好です。'
    }
    const ownerHistoryText = ownerHistoryMap[ownerHistory] || ''

    // 状態に基づく説明文
    const conditionMap: Record<string, string> = {
      '新品・未使用': '新品・未使用品です。タグ付きの美品です。',
      '未使用に近い': 'ほぼ未使用の極美品です。目立つ傷や汚れはありません。',
      '目立った傷や汚れなし': '使用感は少なく、目立った傷や汚れはありません。',
      'やや傷や汚れあり': '若干の使用感はありますが、着用には問題ありません。'
    }
    const conditionText = conditionMap[condition] || ''

    // 着用回数の説明
    const wearCountText = wearCount ? 
      wearCount === '0回' ? '未着用の新品です。' : 
      `着用回数は${wearCount}です。` : ''

    // クリーニング済みの説明
    const cleanedText = isCleaned ? 'クリーニング済みですので、すぐにご着用いただけます。' : ''

    // 特徴の説明
    const featuresText = features ? `装飾の特徴：${features}。` : ''

    // AI生成風の説明文を作成
    const description = `${brand}の${modelName ? modelName + 'モデルの' : ''}ウェディングドレスです。

【商品詳細】
${conditionText} ${ownerHistoryText}
カラーは${color}、サイズは${size}です。${silhouette ? `シルエットは${silhouette}タイプで、` : ''}${neckline ? `${neckline}のネックラインが特徴的です。` : ''}

${featuresText}

【状態について】
${wearCountText} ${cleanedText}
保管は暗所にて丁寧に行っており、型崩れやシミなどはございません。

【お譲りする理由】
結婚式で一度着用した思い出のドレスですが、次の花嫁様にも素敵な思い出を作っていただきたく出品いたしました。

ご質問がございましたら、お気軽にお問い合わせください。
即購入も歓迎いたします。`

    return NextResponse.json({ 
      success: true, 
      description: description.trim() 
    })
  } catch (error) {
    console.error('Error generating description:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}