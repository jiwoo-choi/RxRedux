
# RxRedux

Inspired by [ReactorKit](https://github.com/ReactorKit/ReactorKit)

`React`로 웹 개발시에 컴포넌트의 `State`를 변경하는 로직을 구분하고, 테스트를 보다 직관적으로 진행하기 위해 Swift의 `ReactorKit` 프레임워크를 을 본따 만들었습니다.
`Redux`의 패턴과 비슷하나, 모든 흐름을 `rxjs`로 컨트롤 합니다.

<p align="center">
 
  <a href="https://github.com/jiwoo-choi/JS-ReactorKit" target="_blank">
    <img src="https://img.shields.io/badge/React-^16.13.1-green">
  </a>

 <a href="https://github.com/jiwoo-choi/JS-ReactorKit" target="_blank">
    <img src="https://img.shields.io/badge/Rxjs-^6.6.0-green">
  </a>
  
  <a href="https://github.com/jiwoo-choi/JS-ReactorKit" target="_blank">
    <img src="https://img.shields.io/badge/Typescript-~3.7.2-green">
  </a>
</p>

## Installation

```
npm i jsreactorkit
```

## Concept
`View call(Action) -> Reactor[Action-> Mutation -> State] -> View update(State)`

- Action : 뷰의 행동입니다. 순수하게 뷰의 행동만을 추상화 합니다.  Mutate에게 변할 내용에 대한 힌트를 줍니다.
- State: 뷰의 상태 입니다. 뷰의 결과 상태를 추상화합니다.
- Mutation : 액션의 행동으로 변하게 되는 뷰의 상태에 대한 정의를 하는 부분입니다. (side-effect 는 여기서 일어납니다). State에게 변할 내용의 힌트를 줍니다.

Action, Mutation , State에 대한 자세한 내용은 [ReactorKit](https://github.com/ReactorKit/ReactorKit) 에서 확인할 수 있습니다.

* ReactorKit은 리액터 내부의 흐름을 `RxJs`로 연결합니다.
즉, Action, Mutation, State는 각각 `Rx.Observable`로 연결되어있습니다.
* View에서 Action으로 신호를 emit 하면, Action Observable은 그 신호를 받고  `mutate()`를 통해 Action->Mutation을 진행합니다. 완료시에, Mutation Observable로 전달합니다. Mutation Observable은  `reduce()`를 통해 Mutation 단계의 결과값을 새로운 state로 만들고 State Observable을 부릅니다. State Observable은 전달받은 새로운 state를 currentState에 업데이트 합니다.
* `RxJs`로 구성되어있기때문에 `RxJs`의 강력한 오퍼레이터들을 사용하여 개발 및 테스팅을 할 수 있습니다.

## 메소드

### 생성자

| parameter     | required | default |
|---------------|----------|---------|
| initialState  | true     | none    |
| isStubEnabled | false    | false   |

- initialState : state의 처음 상태입니다.
- isStubEnabled : 테스팅용 Stub입니다. View와의 바인딩을 체크하기 위한 용도입니다.

### Mutate & Reduce
- mutate()는 action으로부터 state를 변경시킬 수 있는 로직을 작성하는 부분입니다.
```
mutate(action: ForumAction): Observable<ForumMutation> {
	switch(action.type) {
		case "CLICKTOPIC":
			return concat(
				//topic change
				of({type:"TOPICCHANGE", topic:  action.newTopic}),
				//is Loading
				of({type:"SETLOADING", isLoading:  true}),
				//WebRequest
				this.fetchList(action.newTopic).pipe(
				takeUntil(this.action.pipe(filter(value  =>  value === action))),
				map( res  => {
				return {type:"FETCHLIST", list:  res, page:  1 }
			})
		...
		...
}
```
- reduce()는 mutation의 결과로부터 state를 업데이트 하는 부분입니다.
```
reduce(state: ForumState, mutation: ForumMutation): ForumState {
	let  newState = state;
	switch(mutation.type) {
		case  "TOPICCHANGE":
		newState.topic = mutation.topic
		return  newState;
	}
	...
}
```

### Transform
transform 메소드는 각 스테이지의 `Observable`을 변경할 수 있습니다. Observable을 확장하거나, 특정 operator를 일괄적으로 적용하고 싶을때 사용할 수 있습니다.
```
transformState(state: Observable<State>): Observable<State> {
	return merge(state, otherReactor.state)
}
// 이제 이 reactor는 state는 otherReactor의 state또한 구독합니다.
```

```
transformState(state: Observable<State>): Observable<State> {
	return state.pipe( tap( _ => console.log("state update!"))
}
// 이제 이 reactor는 state는 업데이트 될때마다 console에 로그를 찍습니다.
```

### Scheduler
async 스케줄러를 사용하면, 원하는 결과값을 도출 할 수 없습니다.
기본 스케줄러는 queueScheduler 입니다.
자세한 내용은 rxjs scheulder를 참조하세요.

### disposeAll
```
reactor.disposeAll();
```
리액터 안에 사용되는 Observable들의 Subscription 해지합니다.

# React-바인딩
리액트의 컴포넌트와 바인딩 할 수 있는 HOC와 메소드도 지원합니다.

## useReactor
```
export default useReactor(Component);
```

# ReactorHook (Experimental)
Functional Component 에서 리액터를 사용할 수 있도록 나온 FC전용 리액터 입니다. Reactor와 기본방식은 같으나 상태관리에 사용할 수 있는 custom hook을 추가하였습니다.

* 뷰와 별도의 바인딩 과정 없이, state의 변화가 감지되면 뷰가 업데이트됩니다.
```
const initalState = {a:123}

function  MyView(){
	const [reactor, currentState] = MyReactor.use(initalState);
	return (
	<>
		<button  onClick={()=>{reactor.action.next({})}}>button</button>
		<div>  {currentState.a}</div>
	</>
	)
}
```

```
class MyReactor extends ReactorHook<Action,State..> {
	mutate(){
		.....
	}
	reduce() {
		....
	}
}
```

# 테스팅

## (자동) 테스팅 대상.
1. 리액터의 검증.
	- 리액터가 원하는 방식대로 Action->Mutate->State 를 따르는지 체크합니다.
	- 로직 테스트이기 때문에 간단히 테스트할 수 있습니다.

2. 뷰와 리액터의 bind() 검증.
	- 뷰와 리액터가 연결되어 있는지 체크합니다.
	- 테스트가 까다롭지만, 컴포넌트와 리액터가 서로 바인딩만 되어있는지 검증합니다.
	

### 1. 리액터 검증

예제 1) action -> state 변경 테스트.
```
it('click write -> mode change test ', done  => {
	reactor = new  ForumReactor(initialState);
	// 액션을 보냅니다.
	reactor.action.next({type:"CLICKWRITE"})
	// 액션에 따라 state가 변하는지 체크합니다.
	expect(reactor.currentState.mode).toBe("edit")
	done();
})
```

예제 2) 다양한 액션이 일어나는 경우에 대한 테스트.
```
it('5. side effect : click topic -> topic change -> loading -> (success) -> loading -> isError false test', done  => {

//moxios 목업 구성.
moxios.wait(() => {
	const  request = moxios.requests.mostRecent()
	request.respondWith({ status:  200, response:  listResultMockup }) 
})

reactor = new  ForumReactor(initialState);

let  state_change = 0;
//리액터의 변경을 여기서 구독합니다.
//concat을 통해 여기서 전달받습니다.
from(reactor.state).subscribe(
	state  => {
        if(state_change === 1) {
            expect(state.topic).toBe("tips");
        } else  if (state_change === 2) {
            expect(state.isLoading).toBeTruthy();
        } else  if (state_change === 3) {
            expect(state.list.length).toBe(2);
        } else  if (state_change === 4) {
            expect(state.isLoading).toBeFalsy();
            expect(state.isError).toBeFalsy();
            done();
        } else {
            done.fail();
        }
            state_change++;
        }
    )
    reactor.action.next({type:"CLICKTOPIC", newTopic:  "tips"})
})
```

## View - Reactor 바인딩 검증.
### 1. 뷰코드 예시.
```

class  SomeView  extends  React.Component<{}, ForumState> implements  ReactorView<ForumReactor> {

button?: HTMLElementSubject;
reactor?: ForumReactor | undefined

constructor(props:{}){
super(props);
	this.state = {
		isError:  false,
		isLoading:  false,
		page:  1,
		mode:"list",
		topic:"clan",
		post:  undefined,
		list:[],
	}
}

componentDidMount(){
	this.reactor = new  ForumReactor(this.state);
}

bind(reactor: ForumReactor): DisposeBag {
	let  disposeBag = new  DisposeBag();
	
	reactor?.state.pipe(
	map(res  =>  res.mode),
	deepDistinctUntilChanged()
	).subscribe( mode  =>  this.setState({mode}))
	return  disposeBag;
}

render(){
	return (
		<button onClick={()=>{this.reactor.next({type:"CLICKBACK"}}></button>
	)
}
}
```
### 2. 테스트 코드
```
it('9. View Binding Check', done  => {
	
	reactor = new  ForumReactor(initialState, true);

	// enzyme을 통해 마운트시키기
	const  wrapper = shallow(<R6Table></R6Table>);

	// 1. 리액터가 이미 존재하는지 체크.
	expect((wrapper.instance() as  any).reactor).not.toBe(undefined);

	// 2. 테스트에서 사용할 리액터를 주입.
	(wrapper.instance() as  any).reactor = reactor;

	// 3. bind()를 수동으로 다시 불러 리액터 업데이트 시키기.
	(wrapper.instance() as  any).bind(reactor);

	// 4. enzyme을 통해 button을 시뮬레이트한다.
	wrapper.find('button').at(0).simulate('click')

	// 5. stub은 모든 액션 기록을 저장한다. 액션을 비교한다.
	expect(reactor.stub.lastAction.type).toBe("CLICKBACK");

	// 6. stub은 또한 state에서 액션을 내보낼 수 있다.
	reactor.stub.state.next({...initialState, mode :  "edit"});

	// 7. 액션을 내보낸 뒤, state가 제대로 변경되었는지 체크한다.
	expect((wrapper.state() as  ForumState).mode).toBe("edit");
	done();
})
```

## 그 외 예제.

### Action & Mutation & State정의
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
`Redux`의 유틸 라이브러리를 활용해 조금더 쉽게 타입을 생성할 수 있습니다.
[typesface-actions](https://github.com/piotrwitek/typesafe-actions)

### To-do list

- [x] initial Commit
- [X] 비동기 대응.
- [X] 비동기 처리 에러.
- [X] 프로젝트 테스트 코드 추가 및 테스트.
- [X] 테스트 기능.
- [X] 문서작성.
- [X] 뷰 .
- [X] 훅기능 추가 (beta)
- [ ] 코드 테스트.
- [ ] 디버깅 기능 추가.

### Dependency
- Rxjs 
- lodash
- react (binding)

### 업데이트 내역
- 글로벌 스토어 삭제, HOC 바인딩 방식, ReactorGroup & Rxjsextension추가.
