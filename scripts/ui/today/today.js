class TodayUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    copyData(data) {
        if (data) {
            $clipboard.text = data
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    generateButtonHandler() {
        if (!$cache.get(this.kernel.cacheKey)) {
            $cache.set(this.kernel.cacheKey, this.kernel.generator.generate())
            // 显示密码
            $("password").title = $cache.get(this.kernel.cacheKey)
            // 是否自动输入
            if (this.kernel.setting.get("keyboard.autoInsert")) {
                this.copyData($cache.get(this.kernel.cacheKey))
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

    passwordListToUi(data) {
        function getLabel(password) {
            return {
                id: {
                    text: password.id
                },
                websiteData: {
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
                noResult: {
                    text: ""
                }
            }
        }

        if (this.allData !== false) {
            let result = []
            for (let password of data) {
                result.push(getLabel(password))
            }
            return result
        }
    }

    storageUi() {
        return [{
            type: "list",
            props: {
                id: "passwordList",
                style: 1,
                reorder: false,
                bgcolor: $color("clear"),
                rowHeight: 60,
                header: {
                    type: "view",
                    props: { height: 35 },
                    views: [
                        {
                            type: "label",
                            props: {
                                font: $font(12),
                                text: $l10n("CLICK_TO_COPY"),
                                textColor: $color({
                                    light: "#545454",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.left
                            },
                            layout: make => {
                                make.left.inset(10)
                                make.bottom.inset(5)
                            }
                        }
                    ]
                },
                footer: {
                    type: "view",
                    views: [
                        {
                            type: "label",
                            props: {
                                font: $font(14),
                                text: $l10n("LIST_END"),
                                textColor: $color({
                                    light: "#545454",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.center
                            },
                            layout: make => {
                                make.bottom.inset(5)
                                make.left.right.inset(0)
                            }
                        }
                    ]
                },
                data: [],
                template: {
                    views: [
                        {
                            type: "label",
                            props: {
                                id: "id",
                                hidden: true
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "websiteData",
                                hidden: true
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "website",
                                font: $font(20),
                                align: $align.left
                            },
                            layout: make => {
                                make.top.inset(10)
                                make.left.inset(10)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "account",
                                font: $font(12),
                                textColor: $color({
                                    light: "#545454",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.left
                            },
                            layout: make => {
                                make.bottom.inset(5)
                                make.left.inset(10)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "date",
                                font: $font(12),
                                textColor: $color({
                                    light: "#545454",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.right
                            },
                            layout: make => {
                                make.bottom.inset(5)
                                make.right.inset(10)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "noResult",
                                align: $align.center
                            },
                            layout: make => {
                                make.left.right.inset(10)
                                make.top.inset(15)
                            }
                        }
                    ]
                },
                actions: [{
                    title: $l10n("COPY_ACCOUNT"),
                    handler: (sender, indexPath) => {
                        this.copyData(sender.object(indexPath).account.text)
                    }
                }]
            },
            events: {
                didSelect: (sender, indexPath, data) => {
                    let password = data.password.text
                    this.copyData(password)
                }
            },
            layout: make => {
                make.top.equalTo($("tab").bottom).offset(10)
                make.left.bottom.right.equalTo(0)
            }
        }]
    }

    homeUi() {
        return [
            {
                type: "button",
                props: {
                    id: "password",
                    title: $cache.get(this.kernel.cacheKey),
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
                        this.copyData(sender.title.trim())
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
                    textColor: $color({
                        light: "#545454",
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
                    tapped: () => {
                        $ui.alert({
                            title: $l10n("ALERT_INFO"),
                            message: $l10n("IF_SAVE_THIS_PASSWORD"),
                            actions: [
                                {
                                    title: $l10n("OK"),
                                    handler: () => {
                                        if ($cache.get(this.kernel.cacheKey)) {
                                            let password = {
                                                password: $cache.get(this.kernel.cacheKey),
                                                account: "AUTO-SAVE",
                                                date: new Date().toLocaleDateString(),
                                                website: ["AUTO-SAVE"]
                                            }
                                            this.save(password)
                                        }
                                    }
                                },
                                {
                                    title: $l10n("CANCEL")
                                }
                            ]
                        })
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
                        this.generateButtonHandler()
                    }
                }
            }
        ]
    }

    render() {
        $ui.render({
            views: [
                {
                    type: "tab",
                    props: {
                        items: [$l10n("GENERATE_BUTTON"), $l10n("STORAGE")]
                    },
                    layout: make => {
                        make.left.top.right.inset(10)
                    },
                    events: {
                        changed: sender => {
                            if (sender.index === 0) {
                                $("home").hidden = false
                                $("storage").hidden = true
                            } else if (sender.index === 1) {
                                $("home").hidden = true
                                $("password-list").data = this.passwordListToUi(this.kernel.storage.all())
                                $("storage").hidden = false
                            }
                        }
                    }
                },
                {
                    type: "view",
                    props: {
                        id: "home",
                        hidden: false
                    },
                    views: this.homeUi(),
                    layout: make => {
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
                    views: this.storageUi(),
                    layout: make => {
                        make.left.bottom.right.inset(0)
                        make.top.inset(50)
                    }
                }
            ]
        })
    }
}

module.exports = TodayUI