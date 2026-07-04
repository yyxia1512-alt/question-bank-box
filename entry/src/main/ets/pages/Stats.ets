import { SEED_MODULES, SEED_QUESTION_COUNT } from '../data/SeedQuestionBank';

@Entry
@Component
struct Stats {
  build() {
    Column({ space: 12 }) {
      Text('统计')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#172033')
        .width('100%')

      this.StatRow('题目总数', `${SEED_QUESTION_COUNT}`)
      this.StatRow('模块数量', `${SEED_MODULES.length}`)
      this.StatRow('错题数', '0')
      this.StatRow('最近练习', '暂无')
    }
    .width('100%')
    .height('100%')
    .padding(20)
    .backgroundColor('#F7F8FA')
  }

  @Builder
  StatRow(label: string, value: string) {
    Row() {
      Text(label).fontSize(15).fontColor('#5D667A')
      Blank()
      Text(value).fontSize(18).fontWeight(FontWeight.Medium).fontColor('#172033')
    }
    .width('100%')
    .height(56)
    .padding({ left: 16, right: 16 })
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
  }
}
