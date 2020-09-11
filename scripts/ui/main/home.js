const EditorUI = require("./editor")

class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.editor = new EditorUI(this.kernel, this.factory)
    }

    copyPassword(password) {
        if (password !== null) {
            $clipboard.text = password
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    generateButtonHandler() {
        if (!$cache.get("password")) {
            $cache.set("password", this.kernel.generator.generate())
            // 显示密码
            $("password-show").title = $cache.get("password")
            // 是否自动复制
            if (this.kernel.setting.get("general.autoCopy")) {
                this.copyPassword($cache.get("password"))
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

    getViews() {
        return [
            this.factory.standardHeader("home-view", $l10n("STRONG_PASSWORD_APP")),
            {
                type: "button",
                props: {
                    id: "password-show",
                    title: $cache.get("password"),
                    align: $align.center,
                    editable: false,
                    bgcolor: $color("systemGray2", "systemFill"),
                    textColor: this.factory.textColor
                },
                layout: (make, view) => {
                    make.left.right.inset(20)
                    make.height.equalTo(40)
                    make.centerY.equalTo(view.super).multipliedBy(0.5)
                },
                events: {
                    tapped: sender => {
                        this.copyPassword(sender.title.trim())
                    }
                }
            },
            {
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
                    make.top.equalTo($("password-show").top).offset(40)
                }
            },
            {
                type: "button",
                props: {
                    title: $l10n("SAVE"),
                    contentEdgeInsets: 10
                },
                layout: (make, view) => {
                    make.left.right.equalTo(view.prev)
                    make.centerY.equalTo(-20).multipliedBy(1.2)
                },
                events: {
                    tapped: () => {
                        if ($cache.get("password")) {
                            this.editor.push({ password: $cache.get("password") })
                        }
                    }
                }
            },
            {
                type: "button",
                props: {
                    title: $l10n("GENERATE_BUTTON"),
                    contentEdgeInsets: 10
                },
                layout: (make, view) => {
                    make.left.right.equalTo(view.prev)
                    make.centerY.equalTo(-20).multipliedBy(1.6)
                },
                events: {
                    tapped: () => {
                        this.generateButtonHandler()
                    }
                }
            }
        ]
    }
}

module.exports = HomeUI