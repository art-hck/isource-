import { ActivatedRoute, Router, UrlTree } from "@angular/router";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { Observable, of, Subscription } from "rxjs";
import { Request } from "../../models/request";
import { RequestGroup } from "../../models/request-group";
import { RequestPosition } from "../../models/request-position";
import { RequestPositionList } from "../../models/request-position-list";
import { RequestService } from "../../../customer/services/request.service";
import { Uuid } from "../../../../cart/models/uuid";
import { UserInfoService } from "../../../../user/service/user-info.service";

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  requestId: Uuid;
  @Input() request: Request;
  @Input() positions: RequestPositionList[];
  @Output() addGroup = new EventEmitter();
  @Output() addPosition = new EventEmitter();
  @Output() addResponsible = new EventEmitter();
  flatPositions$: Observable<RequestPosition[]>;

  form: FormGroup;

  get checkedPositions(): RequestPosition[] {
    return this.formPositionsFlat
      .filter(formGroup => formGroup.get("checked").value)
      .map(formGroup => formGroup.get("position").value)
    ;
  }

  get formPositions(): FormArray {
    return this.form.get('positions') as FormArray;
  }

  get formPositionsFlat() {
    return this.formPositions.controls
      .reduce((arr, formGroup) => {
        if (formGroup && formGroup.get("positions").value.length > 0) {
          return [...arr, ...(formGroup.get("positions") as FormArray).controls];
        }
        return [...arr, formGroup];
      }, [])
      .filter(formGroup => this.asPosition(formGroup.get("position").value));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    public user: UserInfoService
  ) {
  }

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id');
    this.form = this.positionsToForm(this.positions);
    this.flatPositions$ = this.requestService.getRequestPositionsFlat(of(this.positions));
  }

  asGroup(positionList: RequestPositionList): RequestGroup | null {
    return positionList.entityType !== 'GROUP' ? null : positionList as RequestGroup;
  }

  asPosition(positionList: RequestPositionList): RequestPosition | null {
    return positionList.entityType !== 'POSITION' ? null : positionList as RequestPosition;
  }

  navigateToPosition(position: RequestPositionList, e: MouseEvent): void {
    if (!(e.target instanceof HTMLInputElement) && !e.ctrlKey && !e.shiftKey) {
      this.router.navigateByUrl(this.getPositionUrl(position));
      e.preventDefault();
    }
  }

  getPositionUrl(position: RequestPositionList): UrlTree {
    return this.router.createUrlTree([position.id], { relativeTo: this.route });
  }

  private positionsToForm(positions: RequestPositionList[], position?: RequestPositionList) {
    const formGroup = new FormGroup({
      checked: new FormControl(false),
      positions: new FormArray(
        positions.map(p => this.positionsToForm(this.asGroup(p) ? this.asGroup(p).positions : [], p))
      )
    });

    if (position) {
      formGroup.addControl("position", new FormControl(position));
    }

    return formGroup;
  }

  asFormArray(control: AbstractControl) {
    return control as FormArray;
  }
}
