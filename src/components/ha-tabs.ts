/* eslint-disable no-console */

import type { PaperIconButtonElement } from "@polymer/paper-icon-button/paper-icon-button";
import type { PaperTabElement } from "@polymer/paper-tabs/paper-tab";
import "@polymer/paper-tabs/paper-tabs";
import type { PaperTabsElement } from "@polymer/paper-tabs/paper-tabs";
import { customElement } from "lit/decorators";
import { Constructor } from "../types";

const PaperTabs = customElements.get(
  "paper-tabs"
) as Constructor<PaperTabsElement>;

let subTemplate: HTMLTemplateElement;

// prettier-ignore
@customElement("ha-tabs")
export class HaTabs extends PaperTabs {
  private _firstTabWidth = 0;

  private _lastTabWidth = 0;

  private _lastLeftHiddenState = false;

  static get template(): HTMLTemplateElement {
    if (!subTemplate) {
      subTemplate = (PaperTabs as any).template.cloneNode(true);

      const superStyle = subTemplate.content.querySelector("style");

      // Add "noink" attribute for scroll buttons to disable animation.
      subTemplate.content
        .querySelectorAll("paper-icon-button")
        .forEach((arrow: PaperIconButtonElement) => {
          arrow.setAttribute("noink", "");
        });

      superStyle!.appendChild(
        document.createTextNode(`
          #selectionBar {
            box-sizing: border-box;
          }
          .not-visible {
            display: none;
          }
          paper-icon-button {
            width: 24px;
            height: 48px;
            padding: 0;
            margin: 0;
          }
        `)
      );
    }
    return subTemplate;
  }

  private _setTabWidths() {
    const tabs = this.querySelectorAll("paper-tab:not(.hide-tab)");
    if (tabs.length > 0) {
      this._firstTabWidth = tabs[0].clientWidth;
      this._lastTabWidth = tabs[tabs.length - 1].clientWidth;
    }
  }

  public override ready() {
    super.ready();
    console.log("ha-tabs::ready()");
    // this._affectScroll(0); // Fix unintended chevrons on page reload
    // setTimeout(() => { this._affectScroll(0) }, 10);
  }
  
  public override attached() {
    super.attached();
    console.log("ha-tabs::attached()");
    this._setTabWidths();
  }

  // Get first and last tab's width for _affectScroll
  public _tabChanged(tab: PaperTabElement, old: PaperTabElement): void {
    super._tabChanged(tab, old);
    this._setTabWidths();

    // Scroll active tab into view if needed.
    const selected = this.querySelector(".iron-selected");
    if (selected) {
      selected.scrollIntoView();
    }
  }

  /**
   * Modify _affectScroll so that when the scroll arrows appear
   * while scrolling and the tab container shrinks we can counteract
   * the jump in tab position so that the scroll still appears smooth.
   */
  public _affectScroll(dx: number): void {
    console.log("ha-tabs::_affectScroll(%d)", dx);
    console.log(
      "BEFORE: leftHidden(%s), rightHidden(%s), firstTabWidth(%d), lastTabWidth(%d), tabContainerScrollSize(%d)",
      this._leftHidden,
      this._rightHidden,
      this._firstTabWidth,
      this._lastTabWidth,
      this._tabContainerScrollSize,
    );

    if (this._firstTabWidth === 0 || this._lastTabWidth === 0) {
      return;
    }

    this.$.tabsContainer.scrollLeft += dx;

    const scrollLeft = this.$.tabsContainer.scrollLeft;

    this._leftHidden = scrollLeft - this._firstTabWidth < 0;
    this._rightHidden =
      scrollLeft + this._lastTabWidth > this._tabContainerScrollSize;

    if (this._lastLeftHiddenState !== this._leftHidden) {
      this._lastLeftHiddenState = this._leftHidden;
      this.$.tabsContainer.scrollLeft += this._leftHidden ? -23 : 23;
    }

    console.log(
      "AFTER: scrollLeft(%d), leftHidden(%s), rightHidden(%s), firstTabWidth(%d), lastTabWidth(%d), tabContainerScrollSize(%d)",
      scrollLeft,
      this._leftHidden,
      this._rightHidden,
      this._firstTabWidth,
      this._lastTabWidth,
      this._tabContainerScrollSize,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-tabs": HaTabs;
  }
}
