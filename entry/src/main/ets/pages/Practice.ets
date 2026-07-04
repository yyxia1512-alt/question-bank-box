@Entry
@Component
struct Practice {
  @State selected: string[] = [];
  private options: string[] = ['A', 'B', 'C', 'D'];

  build() {
    Column() {
      Text('练习')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#172033')
        .width('100%')
        .padding({ left: 20, top: 20, bottom: 12 })

      Scroll() {
        Column({ space: 14 }) {
          Text('1. 这里展示当前练习题的题干内容（ ）')
            .fontSize(19)
            .fontColor('#172033')
            .lineHeight(28)
            .width('100%')

          ForEach(this.options, (item: string) => {
            Button(`${item}  选项内容`)
              .width('100%')
              .height(52)
              .fontSize(16)
              .fontColor(this.selected.includes(item) ? '#FFFFFF' : '#172033')
              .backgroundColor(this.selected.includes(item) ? '#1F6FEB' : '#FFFFFF')
              .borderRadius(8)
              .onClick(() => {
                this.selected = [item];
              })
          })

          Button('提交')
            .width('100%')
            .height(48)
            .backgroundColor('#1F6FEB')
            .fontColor('#FFFFFF')
            .borderRadius(8)

          Text('解析将在提交后展示。')
            .fontSize(14)
            .fontColor('#6B7280')
            .width('100%')
        }
        .padding({ left: 16, right: 16, bottom: 24 })
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F7F8FA')
  }
}
