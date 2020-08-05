class KeyboardUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    insert_password(password) {
        while ($keyboard.hasText)
            $keyboard.delete()
        $keyboard.insert(password)
        $keyboard.playInputClick()
    }

    generate_button_handler() {
        if (!$cache.get("password")) {
            $cache.set("password", this.kernel.generate_strong_password())
            // 显示密码
            $("password").title = $cache.get("password")
            // 是否自动输入
            if (this.kernel.setting.get("setting.keyboard.auto_insert")) {
                this.insert_password($cache.get("password"))
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

    save(password) {
        if (password.password === "") {
            $ui.toast($l10n("NO_PASSWORD"))
            return false
        }
        if (this.kernel.storage.save(password)) {
            $ui.success($l10n("SAVE_SUCCESS"))
            return true
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
        return false
    }

    password_list_to_ui(data) {
        function get_label(password) {
            return {
                id: {
                    text: password.id
                },
                website_data: {
                    text: JSON.stringify(password.website)
                },
                website: {
                    text: password.website.length > 0 ? password.website[0] : "NULL"
                },
                password: {
                    text: password.password
                },
                account: {
                    text: password.account
                },
                date: {
                    text: password.date
                },
                no_result: {
                    text: ""
                }
            }
        }
        if (this.all_data !== false) {
            let result = []
            for (let password of data) {
                result.push(get_label(password))
            }
            return result
        }
    }

    storage_ui() {
        return [{
            type: "list",
            props: {
                id: "password_list",
                style: 1,
                reorder: false,
                rowHeight: 60,
                footer: {
                    type: "view",
                    views: [
                        {
                            type: "label",
                            props: {
                                font: $font(14),
                                text: $l10n("LIST_END"),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#545454"
                                }),
                                align: $align.center
                            },
                            layout: (make, view) => {
                                make.bottom.inset(5)
                                make.left.right.inset(0)
                            }
                        }
                    ]
                },
                data: [],
                template: {
                    props: {},
                    views: [
                        {
                            type: "label",
                            props: {
                                id: "id",
                                hidden: true,
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "website_data",
                                hidden: true,
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "website",
                                font: $font(18),
                                align: $align.left
                            },
                            layout: (make, view) => {
                                make.top.inset(10)
                                make.left.inset(10)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "account",
                                font: $font(14),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#545454"
                                }),
                                align: $align.left
                            },
                            layout: (make, view) => {
                                make.bottom.inset(5)
                                make.left.inset(10)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "date",
                                font: $font(14),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#545454"
                                }),
                                align: $align.right
                            },
                            layout: (make, view) => {
                                make.bottom.inset(5)
                                make.right.inset(10)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "no_result",
                                align: $align.center
                            },
                            layout: (make, view) => {
                                make.left.right.inset(10)
                                make.top.inset(15)
                            }
                        }
                    ]
                }
            },
            events: {
                didSelect: (sender, indexPath, data) => {
                    let password = data.password.text
                    this.insert_password(password)
                }
            },
            layout: make => {
                make.top.equalTo($("tab").bottom).offset(10)
                make.left.bottom.right.equalTo(0)
            },
        },
        {// 列表上方的分隔线
            type: "view",
            props: {
                bgcolor: $color("#dddddd")
            },
            layout: make => {
                make.left.right.equalTo(0)
                make.top.equalTo($("password_list"))
                make.height.equalTo(1.0 / $device.info.screen.scale)
            }
        }]
    }

    home_ui() {
        return [{
            type: "button",
            props: {
                id: "password",
                title: $cache.get("password"),
                align: $align.center,
                editable: false,
                bgcolor: $color({
                    light: "#eff0f2",
                    dark: "#4B4B4B"
                }),
                titleColor: $color({
                    light: "#4B4B4B",
                    dark: "#DDDDDD"
                })
            },
            layout: (make, view) => {
                make.left.right.inset(10)
                make.centerY.equalTo(view.super).multipliedBy(0.5)
                make.height.equalTo(40)
            },
            events: {
                tapped: sender => {
                    this.insert_password(sender.title.trim())
                }
            }
        },
        {
            type: "label",
            props: {
                text: $l10n("CLICK_TO_INSERT"),
                align: $align.left,
                line: 1,
                font: $font(12),
                textColor: $color({
                    light: "#C0C0C0",
                    dark: "#DDDDDD"
                })
            },
            layout: make => {
                make.left.inset(10)
                make.top.equalTo($("password").top).offset(40)
            }
        },
        {
            type: "button",
            props: {
                title: $l10n("SAVE"),
                contentEdgeInsets: 10
            },
            layout: make => {
                make.left.bottom.inset(10)
                make.width.equalTo(80)
            },
            events: {
                tapped: sender => {
                    if ($cache.get("password")) {
                        const popover = $ui.popover({
                            sourceView: sender,
                            sourceRect: sender.bounds,
                            directions: $popoverDirection.down,
                            size: $size(320, 150),
                            views: [
                                {
                                    type: "input",
                                    props: {
                                        id: "account",
                                        text: "",
                                        align: $align.left,
                                        placeholder: $l10n("ACCOUNT"),
                                    },
                                    layout: (make, view) => {
                                        make.left.right.inset(10)
                                        make.top.inset(10)
                                        make.height.equalTo(40)
                                    },
                                    events: {
                                        returned: sender => { sender.blur() }
                                    }
                                },
                                {
                                    type: "input",
                                    props: {
                                        id: "website",
                                        text: "",
                                        type: $kbType.url,
                                        align: $align.left,
                                        placeholder: $l10n("WEBSITE"),
                                    },
                                    layout: (make, view) => {
                                        make.left.right.inset(10)
                                        make.top.inset(60)
                                        make.height.equalTo(40)
                                    },
                                    events: {
                                        returned: sender => { sender.blur() }
                                    }
                                },
                                {
                                    type: "button",
                                    props: {
                                        image: $image("assets/icon/check.png", "assets/icon/check-dark.png"),
                                        bgcolor: $color("clear"),
                                        titleEdgeInsets: 10,
                                        contentEdgeInsets: 0,
                                    },
                                    layout: (make, view) => {
                                        make.right.inset(10)
                                        make.bottom.inset(25)
                                        make.height.width.equalTo(30)
                                    },
                                    events: {
                                        tapped: () => {
                                            let password = {
                                                password: $("password").title.trim(),
                                                account: $("account").text.trim(),
                                                date: new Date().toLocaleDateString(),
                                                website: [$("website").text.trim()]
                                            }
                                            if (this.save(password)) {
                                                setTimeout(() => { popover.dismiss() }, 500)
                                            }
                                        }
                                    }
                                }
                            ]
                        })
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
                make.right.bottom.inset(10)
                make.left.inset(100)
            },
            events: {
                tapped: () => {
                    this.generate_button_handler()
                }
            }
        }]
    }

    render() {
        $ui.render({
            views: [
                {
                    type: "tab",
                    props: {
                        items: [$l10n("GENERATE_BUTTON"), $l10n("STORAGE")]
                    },
                    layout: (make, view) => {
                        make.left.top.right.inset(10)
                    },
                    events: {
                        changed: sender => {
                            if (sender.index === 0) {
                                $("home").hidden = false
                                $("storage").hidden = true
                            } else if (sender.index === 1) {
                                $("home").hidden = true
                                $("password_list").data = this.password_list_to_ui(this.kernel.storage.all())
                                $("storage").hidden = false
                            }
                        }
                    },
                },
                {
                    type: "view",
                    props: {
                        id: "home",
                        hidden: false
                    },
                    views: this.home_ui(),
                    layout: (make, view) => {
                        make.left.bottom.right.inset(0)
                        make.top.inset(50)
                    }
                },
                {
                    type: "view",
                    props: {
                        id: "storage",
                        hidden: true
                    },
                    views: this.storage_ui(),
                    layout: (make, view) => {
                        make.left.bottom.right.inset(0)
                        make.top.inset(50)
                    }
                }
            ]
        })
    }
}

module.exports = {
    KeyboardUI: KeyboardUI
}