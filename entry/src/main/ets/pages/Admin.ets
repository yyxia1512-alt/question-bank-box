@Entry
@Component
struct Admin {
  @State refreshStatus: string = '空闲';

  build() {
    Column({ space: 12 }) {
      Text('题库')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#172033')
        .width('100%')

      this.RowItem('新增题目', '固定字段录入')
      this.RowItem('导入题库', '仅支持 qbank.zip')
      this.RowItem('导出题库', '备份当前本地数据')
      this.RowItem('一致性刷新', this.refreshStatus)
    }
    .width('100%')
    .height('100%')
    .padding(20)
    .backgroundColor('#F7F8FA')
  }

  @Builder
  RowItem(title: string, subtitle: string) {
    Row() {
      Column() {
        Text(title).fontSize(16).fontColor('#172033')
        Text(subtitle).fontSize(13).fontColor('#6B7280').margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.Start)
      Blank()
      Text('›').fontSize(24).fontColor('#8A93A5')
    }
    .width('100%')
    .height(68)
    .padding({ left: 16, right: 16 })
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
    .onClick(() => {
      if (title === '一致性刷新') {
        this.refreshStatus = '刷新完成';
      }
    })
  }
}
