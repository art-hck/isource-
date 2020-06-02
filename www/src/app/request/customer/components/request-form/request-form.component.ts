import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { Store } from "@ngxs/store";
import { finalize, flatMap, mapTo, takeUntil } from "rxjs/operators";
import { RequestService } from "../../services/request.service";
import { Subject } from "rxjs";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { CustomValidators } from "../../../../shared/forms/custom.validators";

@Component({
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject();
  isLoading = false;

  get formPositions() {
    return this.form.get('positions') as FormArray;
  }

  get validPositions() {
    return this.formPositions.controls.filter(({valid}) => valid);
  }

  constructor(
    private requestService: RequestService,
    private formBuilder: FormBuilder,
    private router: Router,
    public user: UserInfoService,
    public store: Store
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      'name': [null, CustomValidators.requiredNotEmpty],
      'positions': this.formBuilder.array([], [Validators.required, Validators.minLength(1)])
    });
    this.pushPosition();
  }

  pushPosition() {
    this.formPositions.push(this.formBuilder.control(null, Validators.required));
  }

  submit(publish = true) {
    const {name, positions} = this.form.value;
    let request$ = this.requestService.addRequest(name, positions);

    if (publish) {
      request$ = request$.pipe(
        flatMap(request => this.requestService.publishRequest(request.id).pipe(mapTo(request)))
      );
    }

    this.isLoading = true;
    this.form.disable();

    request$.pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.form.enable();
      })
    ).subscribe(data => {
      this.store.dispatch(new ToastActions.Success(publish ? "Заявка опубликована" : "Черновик заявки создан"));
      this.router.navigate(["requests/customer", data.id]);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
