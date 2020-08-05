class EditorUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    save(password, is_update = false) {
        if (password.password === "") {
            $ui.toast($l10n("NO_PASSWORD"))
            return false
        }
        let result = false
        if (is_update) {
            result = this.kernel.storage.update(password)
        } else {
            result = this.kernel.storage.save(password)
        }
        if (result) {
            $ui.success($l10n("SAVE_SUCCESS"))
            setTimeout(() => {
                $ui.pop()
            }, 500)
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
    }

    push(password = null) {
        if (password === null) {
            password = {
                account: "",
                password: "",
                website: [],
                date: ""
            }
        }
        $ui.push({
            props: {
                navBarHidden: true,
                statusBarStyle: 0
            },
            views: [
                {
                    type: "view",
                    props: {
                        clipsToBounds: true,
                    },
                    layout: (make, view) => {
                        if ($device.isIphoneX) {
                            make.top.equalTo(view.super.safeAreaTop).offset(-10)
                        } else {
                            make.top.equalTo(10)
                        }
                        make.width.equalTo(view.super)
                        make.left.right.inset(0)
                        make.bottom.inset(0)
                    },
                    views: [
                        {
                            type: "button",
                            props: {
                                image: $image("assets/icon/back.png", "assets/icon/back-dark.png"),
                                bgcolor: $color("clear")
                            },
                            layout: make => {
                                make.left.inset(10)
                                make.width.height.equalTo(20)
                                make.top.equalTo(30)
                            },
                            events: {
                                tapped: () => {
                                    $ui.pop()
                                }
                            }
                        },
                        {
                            type: "button",
                            props: {
                                title: $l10n("SAVE"),
                                image: $image("assets/icon/check.png", "assets/icon/check-dark.png"),
                                bgcolor: $color("clear")
                            },
                            layout: make => {
                                make.right.inset(10)
                                make.width.height.equalTo(20)
                                make.top.equalTo(30)
                            },
                            events: {
                                tapped: () => {
                                    password.account = $("account").text.trim()
                                    password.password = $("password").text.trim()
                                    password.website = $("website").data
                                    password.date = new Date().toLocaleDateString()
                                    let is_update = false
                                    if (undefined !== password.id) {
                                        is_update = true
                                    }
                                    this.save(password, is_update)
                                }
                            }
                        },
                        {
                            type: "button",
                            props: {
                                title: $l10n("COPY"),
                                image: $image("assets/icon/copy.png", "assets/icon/copy-dark.png"),
                                bgcolor: $color("clear")
                            },
                            layout: (make, view) => {
                                make.right.inset(60)
                                make.width.height.equalTo(20)
                                make.top.equalTo(30)
                            },
                            events: {
                                tapped: () => {
                                    if (password.password === "") {
                                        $ui.toast($l10n("NO_PASSWORD"))
                                    } else {
                                        $clipboard.text = password.password
                                        $ui.toast($l10n("COPY_SUCCESS"))
                                    }
                                }
                            }
                        },
                        {
                            type: "label",
                            props: {
                                text: $l10n("ACCOUNT"),
                                align: $align.left,
                                font: $font(16),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#DDDDDD"
                                }),
                                line: 1,
                            },
                            layout: make => {
                                make.left.inset(10)
                                make.width.equalTo(60)
                                make.height.equalTo(40)
                                make.top.equalTo(70)
                            }
                        },
                        {
                            type: "input",
                            props: {
                                id: "account",
                                align: $align.left,
                                insets: 0,
                                text: password.account,
                                placeholder: $l10n("ACCOUNT"),
                            },
                            layout: make => {
                                make.right.inset(10)
                                make.left.inset(60)
                                make.height.equalTo(40)
                                make.top.equalTo(70)
                            },
                            events: {
                                returned: sender => {
                                    sender.blur()
                                }
                            }
                        },
                        {
                            type: "label",
                            props: {
                                text: $l10n("PASSWORD"),
                                align: $align.left,
                                font: $font(16),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#DDDDDD"
                                }),
                                line: 1,
                            },
                            layout: make => {
                                make.left.inset(10)
                                make.width.equalTo(60)
                                make.height.equalTo(40)
                                make.top.equalTo($("account").top).offset(40 + 30)
                            }
                        },
                        {
                            type: "input",
                            props: {
                                id: "password",
                                align: $align.left,
                                text: password.password,
                                placeholder: $l10n("PASSWORD"),
                            },
                            layout: make => {
                                make.right.inset(10)
                                make.left.inset(60)
                                make.height.equalTo(40)
                                make.top.equalTo($("account").top).offset(40 + 30)
                            },
                            events: {
                                returned: sender => {
                                    sender.blur()
                                }
                            }
                        },
                        {
                            type: "list",
                            props: {
                                id: "website",
                                reorder: false,
                                header: {
                                    type: "label",
                                    props: {
                                        height: 20,
                                        text: $l10n("WEBSITE"),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.left,
                                        font: $font(12)
                                    }
                                },
                                data: password.website,
                                actions: [
                                    {
                                        title: "delete",
                                        handler: () => { }
                                    }
                                ]
                            },
                            layout: make => {
                                make.left.right.inset(10)
                                make.bottom.inset(10)
                                make.centerY.equalTo(0).multipliedBy(1.5)
                            },
                        },
                        {
                            type: "button",
                            props: {
                                title: "+",
                                bgcolor: $color("clear"),
                                font: $font(25),
                                titleColor: $color({
                                    light: "#ADADAD",
                                    dark: "#C0C0C0"
                                })
                            },
                            layout: (make, view) => {
                                make.right.inset(10)
                                make.width.equalTo(30)
                                make.height.equalTo(30)
                                make.centerY.equalTo(0).offset(20)
                            },
                            events: {
                                tapped: sender => {
                                    $ui.popover({
                                        sourceView: sender,
                                        sourceRect: sender.bounds,
                                        directions: $popoverDirection.down,
                                        size: $size(320, 150),
                                        props: {
                                            bgcolor: $color({
                                                light: "#545454",
                                                dark: "#C0C0C0"
                                            })
                                        },
                                        views: [
                                            {
                                                type: "input",
                                                props: {
                                                    id: "website_inbox",
                                                    type: $kbType.url,
                                                    align: $align.left,
                                                    placeholder: $l10n("WEBSITE"),
                                                },
                                                layout: make => {
                                                    make.left.right.inset(10)
                                                    make.top.inset(20)
                                                    make.height.equalTo(40)
                                                },
                                                events: {
                                                    returned: sender => {
                                                        if (sender.text === "") return
                                                        let website = $("website")
                                                        website.insert({
                                                            index: website.data.length,
                                                            value: sender.text
                                                        })
                                                        sender.blur()
                                                        sender.text = ""
                                                    }
                                                }
                                            },
                                            {
                                                type: "button",
                                                props: {
                                                    title: "+",
                                                    titleColor: $color({
                                                        light: "#ADADAD",
                                                        dark: "#C0C0C0"
                                                    }),
                                                    titleEdgeInsets: 10,
                                                    contentEdgeInsets: 0,
                                                },
                                                layout: make => {
                                                    make.right.inset(10)
                                                    make.width.equalTo(30)
                                                    make.height.equalTo(30)
                                                    make.centerY.equalTo(0).offset(20)
                                                },
                                                events: {
                                                    tapped: () => {
                                                        let website_inbox = $("website_inbox")
                                                        if (website_inbox.text === "") return
                                                        let website = $("website")
                                                        website.insert({
                                                            index: website.data.length,
                                                            value: website_inbox.text
                                                        })
                                                        website_inbox.blur()
                                                        website_inbox.text = ""
                                                    }
                                                }
                                            }
                                        ]
                                    })
                                }
                            }
                        }
                    ]
                }
            ]
        })
    }
}

module.exports = {
    EditorUI: EditorUI
}