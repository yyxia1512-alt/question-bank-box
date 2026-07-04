@Entry
@Component
struct WrongQuestions {
  build() {
    Column({ space: 12 }) {
      Text('错题')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#172033')
        .width('100%')

      Text('错题由答题记录和题目版本自动计算。')
        .fontSize(14)
        .fontColor('#6B7280')
        .width('100%')

      Row() {
        Text('暂无错题')
          .fontSize(16)
          .fontColor('#5D667A')
        Blank()
      }
      .height(72)
      .width('100%')
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')
      .borderRadius(8)
    }
    .width('100%')
    .height('100%')
    .padding(20)
    .backgroundColor('#F7F8FA')
  }
}
