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
        let nav_buttons = [
            {
                type: "button",
                props: {
                    symbol: "doc.on.doc",
                    tintColor: $color("primaryText", "secondaryText"),
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(60)
                    make.size.equalTo(20)
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
                type: "button",
                props: {
                    symbol: "checkmark",
                    tintColor: $color("primaryText", "secondaryText"),
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(10)
                    make.size.equalTo(20)
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
            }
        ]
        let views = [
            {
                type: "label",
                props: {
                    text: $l10n("ACCOUNT"),
                    textColor: $color("primaryText", "secondaryText"),
                    align: $align.left,
                    font: $font(16),
                    line: 1,
                },
                layout: make => {
                    make.left.inset(10)
                    make.width.equalTo(60)
                    make.height.equalTo(40)
                    make.top.equalTo(40)
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
                    textColor: $color("primaryText", "secondaryText"),
                },
                layout: (make, view) => {
                    make.right.inset(10)
                    make.left.inset(60)
                    make.height.top.equalTo(view.prev)
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
                    textColor: $color("primaryText", "secondaryText"),
                    align: $align.left,
                    font: $font(16),
                    line: 1,
                },
                layout: (make, view) => {
                    make.left.inset(10)
                    make.width.equalTo(60)
                    make.height.equalTo(view.prev)
                    make.top.equalTo(view.prev).offset(40 + 30)
                }
            },
            {
                type: "input",
                props: {
                    id: "password",
                    align: $align.left,
                    text: password.password,
                    placeholder: $l10n("PASSWORD"),
                    textColor: $color("primaryText", "secondaryText"),
                },
                layout: (make, view) => {
                    make.right.inset(10)
                    make.left.inset(60)
                    make.height.equalTo(view.prev)
                    make.top.equalTo(view.prev)
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
                            align: $align.left,
                            textColor: $color("primaryText", "secondaryText"),
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
                layout: (make, view) => {
                    make.left.right.inset(10)
                    make.bottom.inset(10)
                    make.centerY.equalTo(view.super).multipliedBy(1.5)
                },
            },
            {
                type: "button",
                props: {
                    symbol: "plus",
                    tintColor: $color("primaryText", "secondaryText"),
                    bgcolor: $color("clear")
                },
                layout: (make, view) => {
                    make.right.inset(10)
                    make.size.equalTo(30)
                    make.centerY.equalTo(view.super).offset(20)
                },
                events: {
                    tapped: sender => {
                        $ui.popover({
                            sourceView: sender,
                            sourceRect: sender.bounds,
                            directions: $popoverDirection.down,
                            size: $size(320, 150),
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
                                        symbol: "plus",
                                        tintColor: $color("primaryText", "secondaryText"),
                                        bgcolor: $color("clear")
                                    },
                                    layout: make => {
                                        make.right.inset(10)
                                        make.size.equalTo(30)
                                        make.bottom.inset(40)
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
        this.kernel.ui_push(views, $l10n("BACK"), nav_buttons)
    }
}

module.exports = EditorUI