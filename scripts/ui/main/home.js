const EditorUI = require("./editor")

class HomeUI {
    constructor(kernel) {
        this.kernel = kernel
        this.editor = new EditorUI(this.kernel)
    }

    copyPassword(password) {
        if (password !== null) {
            $clipboard.text = password
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    generateButtonHandler() {
        if (!$cache.get(this.kernel.cacheKey)) {
            $cache.set(this.kernel.cacheKey, this.kernel.generator.generate())
            // 显示密码
            $("password-show").title = $cache.get(this.kernel.cacheKey)
            // 是否自动复制
            if (this.kernel.setting.get("general.autoCopy")) {
                this.copyPassword($cache.get(this.kernel.cacheKey))
            }
        } else {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("PASSWORD_HAS_GENERATED"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            $cache.remove("password")
                            this.generateButtonHandler()
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        }
    }

    getView() {
        return [
            {
                type: "view",
                props: { height: 90 },
                views: [{
                    type: "label",
                    props: {
                        text: $l10n("STRONG_PASSWORD_APP"),
                        textColor: this.kernel.UIKit.textColor,
                        align: $align.left,
                        font: $font("bold", 35),
                        line: 1
                    },
                    layout: (make, view) => {
                        make.left.equalTo(view.super.safeArea).offset(20)
                        make.top.equalTo(view.super.safeAreaTop).offset(50)
                    }
                }]
            },
            {
                type: "view",
                layout: $layout.fill,
                events: {
                    layoutSubviews: () => {
                        let layout = () => {
                            if (this.kernel.UIKit.isLargeScreen()) {
                                $("password-show").remakeLayout((make, view) => {
                                    make.left.inset(20)
                                    make.height.equalTo(40)
                                    make.width.equalTo(view.super).multipliedBy(0.5).offset(-40)
                                    make.centerY.equalTo(view.super)
                                })
                                $("save-button").remakeLayout((make, view) => {
                                    make.right.inset(20)
                                    make.width.equalTo(view.prev)
                                    make.centerY.equalTo(-20).offset(-40)
                                })
                                $("generate-button").remakeLayout((make, view) => {
                                    make.width.right.equalTo(view.prev)
                                    make.centerY.equalTo(-20).offset(40)
                                })
                            } else {
                                $("password-show").remakeLayout(make => {
                                    make.left.right.inset(20)
                                    make.height.equalTo(40)
                                    make.top.inset(200)
                                })
                                $("save-button").remakeLayout((make, view) => {
                                    make.left.right.equalTo(view.prev)
                                    make.centerY.equalTo(-20).multipliedBy(1.2)
                                })
                                $("generate-button").remakeLayout((make, view) => {
                                    make.left.right.equalTo(view.prev)
                                    make.centerY.equalTo(-20).multipliedBy(1.6)
                                })
                            }
                        }
                        if (!this.orientation) {
                            this.orientation = $device.info.screen.orientation
                            layout()
                            return
                        }
                        if (this.orientation !== $device.info.screen.orientation) {
                            this.orientation = $device.info.screen.orientation
                            layout()
                        }
                    }
                },
                views: [
                    {// password
                        type: "button",
                        props: {
                            id: "password-show",
                            title: $cache.get(this.kernel.cacheKey),
                            align: $align.center,
                            editable: false,
                            bgcolor: $color("systemGray2", "systemFill"),
                            textColor: this.kernel.UIKit.textColor
                        },
                        events: {
                            tapped: sender => {
                                this.copyPassword(sender.title.trim())
                            }
                        }
                    },
                    {// 提示字符
                        type: "label",
                        props: {
                            text: $l10n("CLICK_TO_COPY"),
                            align: $align.left,
                            line: 1,
                            font: $font(12),
                            textColor: $color("systemPlaceholderText")
                        },
                        layout: (make, view) => {
                            make.left.right.equalTo(view.prev)
                            make.top.equalTo(view.prev.top).offset(40)
                        }
                    },
                    {// SAVE
                        type: "button",
                        props: {
                            title: $l10n("SAVE"),
                            id: "save-button",
                            contentEdgeInsets: 10
                        },
                        events: {
                            tapped: () => {
                                if ($cache.get(this.kernel.cacheKey)) {
                                    this.editor.push({ password: $cache.get(this.kernel.cacheKey) }, $l10n("SAVE"))
                                }
                            }
                        }
                    },
                    {// GENERATE_BUTTON
                        type: "button",
                        props: {
                            title: $l10n("GENERATE_BUTTON"),
                            id: "generate-button",
                            contentEdgeInsets: 10
                        },
                        events: {
                            tapped: () => {
                                this.generateButtonHandler()
                            }
                        }
                    }
                ]
            }
        ]
    }
}

module.exports = HomeUI