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

## 리액트 뷰 연결하는 방법.
`ReactiveView`라는 Wrapper를 지원합니다. (Class - Component만 지원)

`ReactiveView`의 역할은 `disposeBag`으로 `Subscrpition`을 관리해주고, 컴포넌트가 마운트되면 `bind()`를 수행시켜줍니다.

`ReactiveView`는 `ReactorView`라는 인터페이스를 구현한 뷰에만 정상작동됩니다.

### 예제
```
class TestView extends React.Component<{}, ModalState> implements ReactorView<ModalReactor> {

    reactor?: ModalReactor;
    
    constructor(props:{}) {
        super(props)

        this.state = {
            isOpened:false
        }
        
        this.reactor = new ModalReactor(this.state);
    }

    bind(reactor: ModalReactor): DisposeBag {
        let disposeBag = new DisposeBag();
        disposeBag.disposeOf = reactor.state.pipe(map( res => res.isOpened), finalize( ()=> console.log('unsubscribed'))).subscribe(isOpened => this.setState({isOpened}))
        return disposeBag;
    }
    
    render(){
        return(<div>
            <Button onClick={()=>{this.reactor?.action.next({type:"MODALTOGGLE"})}}>A</Button>
            {(this.state.isOpened)? "A": "B"}
        </div>)
    }
}
```
테스트뷰를 `ReactiveView`로 감싸 Export합니다.
```
export default ReactiveView(TestView)
```

## Global Store

JS 리액터킷 React의 Context API를 활용해 글로벌 스토어를 지원합니다.

### 1. Store 등록

글로벌 스토어로 사용할것을 앱의 최상단 루트에서 `register`함수를 이용해 등록합니다.

```
const value = register([new ModalReactor({isOpened: false},false,true)])
```

### 2. Provider
앱의 최상단에서 `GlobalReactor.Provider`로 감싸줍니다.
```
App.tsx //최상단

const value = register([new ModalReactor({isOpened: false},false,true)])

render(){
    return (
        <GlobalReactor.Provider value={value}>
            ....
            .....
        </GlobalReactor.Provider>
    )
}
```

### 3. State 바꾸기 / 구독하기.

### 3-1. Export using Wrapper.

마찬가지로 전용 뷰 Wrapper인 `Global`이라는 함수를 지원합니다.

`Global`에서는 Reactor의 이름으로 글로벌 리액터중에서 원하는 리액터를 선택해야합니다. 

```
export default Global(SomeView, ModalReactor.name)
```

### 3-2. "SomeView" 구현하기.

위의 SomeView예시처럼 `Global(SomeView, ...)`에 내가 작업하던 뷰를 담으려면, 몇가지 규칙이 있습니다.

1. 기존 관리하던 로컬 `State`와 차별점을 두기위해서 글로벌 상태는 `Props`로 받을 수 있습니다.

2. 지금 작성하고 있는 뷰에서 받고싶은 `State`와 `Reactor`의 타입을 인터페이스 `GlobalReactorProps<T,K>` 를 통해 명시하고, Props로 받는다고 선언합니다.

### 예제 - state받기
```
class TestViewGlobalGetState extends React.Component<GlobalReactorProps<ModalReactor,ModalState>>{
    render(){
        return(
            <Button>
                {this.props.globalState.isOpened? "OPENED" : "UNOPENED"}
            </Button>
        )
    }
}
```
### 예제 - state바꾸기
```
class TestViewGlobalChangeState extends React.Component<GlobalReactorProps<ModalReactor,ModalState>>{
    
    render(){
        return(
            <Button onClick={()=>{this.props.globalRactor.action.next({type:"MODALTOGGLE"})}}>
                바꾸는버튼
            </Button>
        )
    }
}
```

### 예제 - export
```
export const GLOBALTEST = Global(TestViewGlobalGetState, ModalReactor.name)
export const GLOBALTEST2 = Global(TestViewGlobalChangeState, ModalReactor.name)
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
- [X] 문서작성.
- [X] 뷰 .
- [ ] 코드 테스트.
- [ ] 디버깅 기능 추가.

### 업데이트내역.
- disposeBag 추가
- ReactorView Interface

### Dependency
- Rxjs 

