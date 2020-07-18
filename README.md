# JS - ReactorKit

Inspired by [ReactorKit](https://github.com/ReactorKit/ReactorKit)

`React` 웹 개발시에 뷰와 `State`를 변경하는 로직을 구분하고, 테스트를 보다 쉽게 진행하기 위해 `ReactorKit`을 본따 만들었습니다.

`Mobx` & `Mobx-react`나 `Redux`같은 State 관리 라이브러리보다 소규모로 시작할 수 있고, 테스트코드를 보다 빠르게 작성할 수 있을것이라는 기대하에 사용 및 테스트중입니다.


## Example
### Action 및 State정의
```
interface State {
    value: number
}

export const INCREASE = 'INCREASE'
export const DECREASE = 'DECREASE'

interface INCREASEACTION { 
    type: typeof INCREASE
}
interface DECREASEACTION { 
    type: typeof DECREASE
}

export type ActionType = INCREASEACTION | DECREASEACTION
```


### TestReactor코드
```
export class TestReactor extends Reactor<ActionType,State> {

    mutate(action: ActionType): Observable<ActionType> {
        return of(action);
    }
    
    reduce(state: State, mutation: ActionType): State {
        let newState = state;
        switch(mutation.type) {
            case "DECREASE":
                newState.value = newState.value - 1; 
                return newState;
            case "INCREASE":
                newState.value = newState.value + 1; 
                return newState;
        }
    }

    transformAction(action: Observable<ActionType>): Observable<ActionType> {
        return action
    }
    transformMutation(mutation: Observable<ActionType>): Observable<ActionType> {
        return mutation
    }
    transformState(state: Observable<State>): Observable<State> {
        return state
    }
}
```

### View 코드
```
export class View extends React.PureComponent<{},State> {

viewAction? : Subject<ActionType>;
    reactor?: TestReactor;
    
    constructor(props: {}){
        super(props);
        this.state = {
            value : 0
        }
    }

    componentDidMount(){
        this.viewAction = new Subject<ActionType>();
        this.reactor = new TestReactor(this.state);
    }

    // 후에 다시 바인딩을 할 수 있도록, bind()라는 함수를 따로 만들어 빼어줬습니다.
    bind(){
        this.viewAction?.subscribe(this.reactor?.action)
        this.reactor?.state.pipe( 
            distinctUntilChanged(),
            map( state => state.value))
        .subscribe(
            value=>{
                this.setState({value})
            }
        ) 
    }
   
    render(){

        return(
            <>
                <div>
                    Counter
                </div>
                <div>
                    {this.state.value}
                </div>
                <button onClick={()=>{this.viewAction?.next({type:"INCREASE"})}}>
                    +
                </button>
                <button onClick={()=>{this.viewAction?.next({type:"DECREASE"})}}>
                    -
                </button>

            </>
        )

    }
}
```


## 테스트방법 (using Jest & Enzyme)

### View -> Reactor 테스트
```
    it('INCREASE ONCE TEST', (done)=> {
        const reactor = new TestReactor({value:0});
        reactor.action.next({type:"INCREASE"})
        expect(reactor.currentState.value).toBe(1);
        done();
    })

    it('INCREASE-DECREASE TEST - 2', (done)=> {
        const reactor = new TestReactor({value:0});
        reactor.action.next({type:"INCREASE"})
        reactor.action.next({type:"DECREASE"})
        expect(reactor.currentState.value).toBe(0);
        done();
    })
```

### Reactor -> View 테스트
```
it('INCREASE ACTION PROPAGATION TESTING', ()=> {

        // stub 사용 On.
        const reactor = new TestReactor({value:1}, true);
        
        // enzyme을 통해 컴포넌트를 마운트 시킵니다.
        const wrapper = shallow(<View/>);
        
        // 컴포넌트에 reactor를 주입 한 후 bind()를 통해 업데이트 시킵니다. (View코드 참조)
        (wrapper.instance() as View).reactor = reactor;
        (wrapper.instance() as View).bind();
        (wrapper.instance() as View).viewAction?.next({type:"INCREASE"})
        
        // stub은 action들을 들어온 액션들을 모두 기록합니다.
        expect(reactor.stub.actions[reactor.stub.actions.length-1]).toStrictEqual({type:"INCREASE"})
    })


    it('TESTING VIEW AFTER INCREASE STATE CHANGE IN REACTOR', () => {
    
        // Stub 사용 on.
        const reactor = new TestReactor({value:1}, true);
        
        // enzyme을 통해 컴포넌트를 마운트 시킵니다.
        const wrapper = shallow(<View/>);
        
        // 컴포넌트에 reactor를 주입 한 후 bind()를 통해 업데이트 시킵니다. (View코드 참조)
        (wrapper.instance() as View).reactor = reactor;
        (wrapper.instance() as View).bind();
        
        // stub을 통해 state에 직접 상태를 전달할 수 있습니다.
        (wrapper.instance() as View).reactor?.stub.state.next({value:2});
        
        // enzyme을 통해 결과 state를 관찰합니다.
        const result = (wrapper.state() as {value:number}).value;
        expect(result).toBe(2);
    })
```

### To-do list

- [x] initial Commit
- [X] 비동기 대응.
- [X] 비동기 처리 에러.
- [X] 프로젝트 테스트 코드 추가 및 테스트.
- [X] 테스트 기능.
- [ ] 문서작성.
- [ ] 코드 테스트.

### 업데이트내역.
- disposeBag 추가
- ReactorView Interface

### Dependency
- Rxjs 

