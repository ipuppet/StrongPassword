const { Kernel } = require("../EasyJsBox/src/kernel")
const Generator = require("./generator")
const Storage = require("./storage")

class AppKernel extends Kernel {
    constructor() {
        super()
        this.settingComponent = this.registerComponent("Setting")
        this.setting = this.settingComponent.controller
        this.initSettingMethods()
        this.generator = new Generator(this.setting)
        this.storage = new Storage(this.setting)
        this.cacheKey = "password"
    }

    /**
     * 注入设置中的脚本类型方法
     */
    initSettingMethods() {
        this.setting.readme = () => {
            const content = $file.read("/README.md").string
            this.UIKit.push({
                views: [{
                    type: "markdown",
                    props: { content: content },
                    layout: (make, view) => {
                        make.size.equalTo(view.super)
                    }
                }]
            })
        }
        this.setting.backupToICloud = animate => {
            animate.actionStart()
            const backupAction = () => {
                if (this.storage.backupToICloud()) {
                    $ui.alert($l10n("BACKUP_SUCCESS"))
                    animate.actionDone()
                } else {
                    $ui.alert($l10n("BACKUP_ERROR"))
                    animate.actionCancel()
                }
            }
            if (this.storage.hasBackup()) {
                $ui.alert({
                    title: $l10n("BACKUP"),
                    message: $l10n("ALREADY_HAS_BACKUP"),
                    actions: [
                        {
                            title: $l10n("OK"),
                            handler: () => {
                                backupAction()
                            }
                        },
                        {
                            title: $l10n("CANCEL"),
                            handler: () => { animate.actionCancel() }
                        }
                    ]
                })
            } else {
                backupAction()
            }
        }
        this.setting.recoverFromICloud = animate => {
            animate.actionStart()
            $drive.open({
                handler: data => {
                    if (this.storage.recoverFromICloud(data)) {
                        animate.actionDone()
                    } else {
                        animate.actionCancel()
                    }
                }
            })
        }
    }
}

module.exports = {
    run: () => {
        if ($app.env === $env.widget) {
            $widget.setTimeline({
                render: () => {
                    return {
                        type: "text",
                        props: {
                            text: "暂无"
                        }
                    }
                }
            })
        } else if ($app.env === $env.app) {
            const kernel = new AppKernel()
            // 设置样式
            kernel.UIKit.disableLargeTitle()
            kernel.setting.setChildPage(true)
            // 设置 navButtons
            kernel.UIKit.setNavButtons([
                kernel.UIKit.navButton("setting", "gear", () => {
                    kernel.UIKit.push({
                        title: $l10n("SETTING"),
                        views: kernel.setting.getView()
                    })
                }),
                kernel.UIKit.navButton("storage", "archivebox", () => {
                    const StorageUI = require("./ui/main/storage")
                    const interfaceUi = new StorageUI(kernel)
                    kernel.UIKit.push({
                        title: $l10n("STORAGE"),
                        views: interfaceUi.getView(),
                        navButtons: [{
                            symbol: "plus",
                            handler: () => {
                                interfaceUi.editor.push(null, $l10n("ADD_PASSWORD"), () => {
                                    setTimeout(() => interfaceUi.update(), 500)
                                })
                            }
                        }]
                    })
                })
            ])
            const HomeUI = require("./ui/main/home")
            const interfaceUi = new HomeUI(kernel)
            kernel.UIRender(interfaceUi.getView())
        } else if ($app.env === $env.keyboard) {
            const KeyboardUI = require("./ui/keyboard/keyboard")
            new KeyboardUI(this.kernel).render()
        } else if ($app.env === $env.today) {
            const TodayUI = require("./ui/today/today")
            new TodayUI(this.kernel).render()
        } else {
            $intents.finish("不支持在此环境中运行")
            $ui.render({
                views: [{
                    type: "label",
                    props: {
                        text: "不支持在此环境中运行",
                        align: $align.center
                    },
                    layout: (make, view) => {
                        make.center.equalTo(view.super)
                        make.size.equalTo(view.super)
                    }
                }]
            })
        }
    }
}