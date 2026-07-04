import router from '@ohos.router';
import { SEED_MODULES, SEED_QUESTION_COUNT } from '../data/SeedQuestionBank';

@Entry
@Component
struct Index {
  @State activeTab: string = 'practice';

  build() {
    Column() {
      Row() {
        Text('题库匣')
          .fontSize(26)
          .fontWeight(FontWeight.Bold)
          .fontColor('#172033')
        Blank()
        Text(`${SEED_QUESTION_COUNT} 题`)
          .fontSize(14)
          .fontColor('#5D667A')
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 20, bottom: 12 })

      Column() {
        this.PracticePanel()
      }
      .layoutWeight(1)
      .width('100%')

      Row() {
        this.TabButton('practice', '练习')
        this.TabButton('wrong', '错题')
        this.TabButton('admin', '题库')
        this.TabButton('stats', '统计')
      }
      .width('100%')
      .height(64)
      .backgroundColor('#FFFFFF')
      .border({ width: { top: 1 }, color: '#E5E8EF' })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F7F8FA')
  }

  @Builder
  PracticePanel() {
    Column({ space: 12 }) {
      this.ActionRow('全量刷题', '当前题库全部题目', () => {
        router.pushUrl({ url: 'pages/Practice', params: { scope: 'all' } });
      })
      this.ActionRow('模块刷题', '按模块进入，可继续选择题型', () => {
        router.pushUrl({ url: 'pages/Practice', params: { scope: 'module' } });
      })
      this.ActionRow('继续练习', '恢复最近一次未完成会话', () => {
        router.pushUrl({ url: 'pages/Practice', params: { scope: 'resume' } });
      })

      Text('模块')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .fontColor('#172033')
        .margin({ top: 16 })

      ForEach(SEED_MODULES, (module) => {
        this.ModuleRow(module.name, `${module.count} 题`)
      })
    }
    .width('100%')
    .padding({ left: 16, right: 16 })
  }

  @Builder
  ActionRow(title: string, subtitle: string, action: () => void) {
    Button() {
      Row() {
        Column() {
          Text(title).fontSize(17).fontWeight(FontWeight.Medium).fontColor('#172033')
          Text(subtitle).fontSize(13).fontColor('#6B7280').margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Start)
        Blank()
        Text('›').fontSize(24).fontColor('#8A93A5')
      }
      .width('100%')
    }
    .height(72)
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
    .padding({ left: 16, right: 16 })
    .onClick(action)
  }

  @Builder
  ModuleRow(name: string, count: string) {
    Row() {
      Text(name).fontSize(15).fontColor('#172033')
      Blank()
      Text(count).fontSize(13).fontColor('#6B7280')
    }
    .width('100%')
    .height(44)
    .padding({ left: 4, right: 4 })
  }

  @Builder
  TabButton(key: string, label: string) {
    Button(label)
      .layoutWeight(1)
      .height(48)
      .fontSize(14)
      .fontColor(this.activeTab === key ? '#1F6FEB' : '#5D667A')
      .backgroundColor('#FFFFFF')
      .onClick(() => {
        if (key === 'wrong') {
          router.pushUrl({ url: 'pages/WrongQuestions' });
        } else if (key === 'admin') {
          router.pushUrl({ url: 'pages/Admin' });
        } else if (key === 'stats') {
          router.pushUrl({ url: 'pages/Stats' });
        } else {
          this.activeTab = key;
        }
      })
  }
}
