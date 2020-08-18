const EditorUI = require("./editor")

class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.editor = new EditorUI(this.kernel, this.factory)
    }

    copy_password(password) {
        if (password !== null) {
            $clipboard.text = password
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    generate_button_handler() {
        if (!$cache.get("password")) {
            $cache.set("password", this.kernel.generator.generate())
            // 显示密码
            $("password_show").title = $cache.get("password")
            // 是否自动复制
            if (this.kernel.setting.get("setting.general.auto_copy")) {
                this.copy_password($cache.get("password"))
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
                            this.generate_button_handler()
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        }
    }

    get_views() {
        return [
            {
                type: "label",
                props: {
                    text: $l10n("STRONG_PASSWORD_APP"),
                    textColor: this.factory.text_color,
                    align: $align.left,
                    font: $font("bold", 34),
                    line: 1,
                },
                layout: (make, view) => {
                    make.left.right.inset(10)
                    make.height.equalTo(40)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            },
            {
                type: "button",
                props: {
                    id: "password_show",
                    title: $cache.get("password"),
                    align: $align.center,
                    editable: false,
                    bgcolor: $color("systemGray2", "systemFill"),
                    textColor: this.factory.text_color,
                },
                layout: (make, view) => {
                    make.left.right.inset(10)
                    make.height.equalTo(40)
                    make.centerY.equalTo(view.super).multipliedBy(0.5)
                },
                events: {
                    tapped: sender => {
                        this.copy_password(sender.title.trim())
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
                layout: make => {
                    make.left.inset(10)
                    make.top.equalTo($("password_show").top).offset(40)
                }
            },
            {
                type: "button",
                props: {
                    title: $l10n("SAVE"),
                    contentEdgeInsets: 10
                },
                layout: make => {
                    make.left.right.inset(10)
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
                layout: make => {
                    make.left.right.inset(10)
                    make.centerY.equalTo(-20).multipliedBy(1.6)
                },
                events: {
                    tapped: () => {
                        this.generate_button_handler()
                    }
                }
            }
        ]
    }
}

module.exports = HomeUI